/**
 * Trí Đức Car Media — Behaviour tracking sink (Google Apps Script)
 * ---------------------------------------------------------------
 * Paste into the tracking spreadsheet: Extensions → Apps Script → Code.gs.
 * Then run setup() once, Deploy → New deployment → Web app
 * (Execute as: Me, Who has access: Anyone) and give the /exec URL to the
 * website as TRACKING_WEBHOOK_URL. The TOKEN printed by setup() goes into the
 * website secret TRACKING_TOKEN. Full guide: hq/05-TRACKING-SYSTEM.md.
 *
 * Website side: lib/tracking/engine.ts → app/api/track/route.ts → doPost here.
 * Grid: 1 sensor = 1 CSS centimetre (≈37.8 px), id r{row}c{col}, per layout
 * bucket (desktop ≥1024 px / tablet ≥640 px / mobile).
 */

var TZ = 'Asia/Ho_Chi_Minh';

/** FIELD_MAP for every raw tab: header order = column order. */
var TABS = {
  Pageviews: ['Thời gian (GMT+7)', 'Giờ trình duyệt', 'Visitor ID', 'Session ID', 'Pageview ID', 'Phiên mới',
    'IP', 'Quốc gia', 'Tỉnh/Vùng', 'Thành phố', 'Mã bưu chính', 'Vĩ độ', 'Kinh độ', 'ASN', 'Nhà mạng/ISP', 'Cloudflare PoP',
    'User-Agent', 'Trình duyệt', 'Hệ điều hành', 'Thiết bị', 'Layout', 'Viewport', 'Màn hình', 'DPR', 'Ngôn ngữ', 'Accept-Language',
    'Múi giờ', 'Mạng', 'Cảm ứng', 'Đường dẫn', 'Tiêu đề', 'URL đầy đủ', 'Nguồn giới thiệu (referrer)',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'Tải trang (ms)', 'Rộng trang (px)', 'Cao trang (px)'],
  Events: ['Thời gian (GMT+7)', 'Giờ trình duyệt', 'Visitor ID', 'Session ID', 'Pageview ID', 'IP', 'Đường dẫn', 'Layout',
    'Loại sự kiện', 'Sensor ID', 'Hàng (cm)', 'Cột (cm)', 'X (px)', 'Y (px)', 'Thẻ', 'Nội dung/nhãn', 'Link', 'Giá trị', 'Chi tiết (JSON)'],
  Sensors: ['Thời gian (GMT+7)', 'Visitor ID', 'Session ID', 'Pageview ID', 'IP', 'Đường dẫn', 'Layout',
    'Sensor ID', 'Hàng (cm)', 'Cột (cm)', 'Rê chuột (ms)', 'Số lần di chuột', 'Số click'],
  Attention: ['Thời gian (GMT+7)', 'Visitor ID', 'Session ID', 'Pageview ID', 'Đường dẫn', 'Layout', 'Hàng (cm)', 'Thời gian trong màn hình (ms)'],
};

// ───────────────────────── entry points ─────────────────────────

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'bad_json' });
  }
  var token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!token || body.token !== token) return json({ ok: false, error: 'unauthorized' });

  if (body.action === 'ingest') return json(ingest(body.server, body.batch));
  if (body.action === 'heatmap') return json(heatmapData(body.path, body.layout));
  return json({ ok: false, error: 'unknown_action' });
}

function doGet() {
  return json({ ok: true, service: 'triduccar.media tracking' });
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📊 Tracking')
    .addItem('1. Thiết lập (chạy 1 lần)', 'setup')
    .addItem('Cập nhật báo cáo + heatmap ngay', 'rebuildReports')
    .addItem('Xem TOKEN', 'showToken')
    .addToUi();
}

// ───────────────────────── setup ─────────────────────────

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(TZ);
  Object.keys(TABS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.getRange(1, 1, 1, TABS[name].length).setValues([TABS[name]]).setFontWeight('bold').setBackground('#0b1220').setFontColor('#f0c069');
    sh.setFrozenRows(1);
  });
  writeDictionary_(ss);
  var blank = ss.getSheetByName('Trang tính1') || ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);

  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('TOKEN')) props.setProperty('TOKEN', Utilities.getUuid().replace(/-/g, ''));

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'rebuildReports') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('rebuildReports').timeBased().everyHours(1).create();

  var warn = '';
  try {
    var access = DriveApp.getFileById(ss.getId()).getSharingAccess();
    if (access !== DriveApp.Access.PRIVATE) {
      warn = '\n\n⚠️ File đang chia sẻ công khai bằng link (' + access + '). Sheet sẽ chứa IP khách — hãy đổi Chia sẻ → "Bị hạn chế".';
    }
  } catch (err) { /* Drive scope not granted */ }

  SpreadsheetApp.getUi().alert('Đã thiết lập xong.\n\nTOKEN (dán vào secret TRACKING_TOKEN của website):\n' +
    props.getProperty('TOKEN') + '\n\nTiếp theo: Deploy → New deployment → Web app → Execute as Me, Anyone.' + warn);
}

function showToken() {
  SpreadsheetApp.getUi().alert('TOKEN: ' + PropertiesService.getScriptProperties().getProperty('TOKEN'));
}

// ───────────────────────── ingest ─────────────────────────

function ingest(server, b) {
  if (!server || !b) return { ok: false, error: 'empty' };
  var at = vnTime_(server.receivedAt);
  var env = b.env || {};
  var ua = parseUA_(server.userAgent || '');
  var pv = [], ev = [], se = [], at2 = [];

  (b.events || []).forEach(function (e) {
    var client = vnTime_(e.ts);
    if (e.type === 'page_view') {
      pv.push([at, client, b.vid, b.sid, b.pvId, !!e.newSession,
        server.ip, server.country, server.region, server.city, server.postalCode, server.latitude, server.longitude,
        server.asn, server.asOrg, server.colo, server.userAgent, ua.browser, ua.os, ua.device, b.layout,
        (env.vw || '') + '×' + (env.vh || ''), (env.sw || '') + '×' + (env.sh || ''), env.dpr || '', env.lang || '',
        server.acceptLanguage, env.tz || '', env.conn || '', env.touch === true,
        b.path, e.title || '', e.url || '', e.referrer || '',
        e.utm_source || '', e.utm_medium || '', e.utm_campaign || '', e.utm_term || '', e.utm_content || '',
        e.gclid || '', e.fbclid || '', e.loadMs || '', env.docW || '', env.docH || '']);
    }
    var known = { type: 1, ts: 1, row: 1, col: 1, x: 1, y: 1, tag: 1, text: 1, href: 1, value: 1 };
    var extra = {};
    Object.keys(e).forEach(function (k) { if (!known[k]) extra[k] = e[k]; });
    var hasCell = e.row !== undefined && e.col !== undefined;
    ev.push([at, client, b.vid, b.sid, b.pvId, server.ip, b.path, b.layout, e.type,
      hasCell ? 'r' + e.row + 'c' + e.col : '', hasCell ? e.row : '', hasCell ? e.col : '',
      e.x !== undefined ? e.x : '', e.y !== undefined ? e.y : '', e.tag || '', e.text || '', e.href || '',
      e.value !== undefined ? e.value : '', Object.keys(extra).length ? JSON.stringify(extra) : '']);
  });

  (b.sensors || []).forEach(function (s) {
    se.push([at, b.vid, b.sid, b.pvId, server.ip, b.path, b.layout, 'r' + s[0] + 'c' + s[1], s[0], s[1], s[2], s[3], s[4]]);
  });
  (b.rows || []).forEach(function (r) {
    at2.push([at, b.vid, b.sid, b.pvId, b.path, b.layout, r[0], r[1]]);
  });

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    append_('Pageviews', pv);
    append_('Events', ev);
    append_('Sensors', se);
    append_('Attention', at2);
  } finally {
    lock.releaseLock();
  }
  return { ok: true, pageviews: pv.length, events: ev.length, sensors: se.length, rows: at2.length };
}

// ───────────────────────── heatmap API (website overlay) ─────────────────────────

function heatmapData(path, layout) {
  var key = 'hm:' + layout + ':' + path;
  var cache = CacheService.getScriptCache();
  var hit = cache.get(key);
  if (hit) return JSON.parse(hit);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cells = {}, rows = {}, sessionsPerCell = {};
  rowsOf_(ss, 'Sensors').forEach(function (r) {
    if (r[5] !== path || r[6] !== layout) return;
    var id = r[7];
    var c = cells[id] || (cells[id] = [r[8], r[9], 0, 0, 0, 0]);
    c[2] += Number(r[10]) || 0; c[3] += Number(r[11]) || 0; c[4] += Number(r[12]) || 0;
    (sessionsPerCell[id] = sessionsPerCell[id] || {})[r[2]] = 1;
  });
  Object.keys(cells).forEach(function (id) { cells[id][5] = Object.keys(sessionsPerCell[id]).length; });
  rowsOf_(ss, 'Attention').forEach(function (r) {
    if (r[4] !== path || r[5] !== layout) return;
    rows[r[6]] = (rows[r[6]] || 0) + (Number(r[7]) || 0);
  });
  var pvs = 0, visitors = {};
  rowsOf_(ss, 'Pageviews').forEach(function (r) {
    if (r[29] !== path || r[20] !== layout) return;
    pvs++; visitors[r[2]] = 1;
  });
  var out = {
    ok: true,
    cells: Object.keys(cells).map(function (k) { return cells[k]; }),
    rows: Object.keys(rows).map(function (k) { return [Number(k), rows[k]]; }),
    pageviews: pvs,
    visitors: Object.keys(visitors).length,
    updatedAt: vnTime_(new Date().toISOString()),
  };
  var s = JSON.stringify(out);
  if (s.length < 90000) cache.put(key, s, 300);
  return out;
}

// ───────────────────────── reports (hourly trigger) ─────────────────────────

function rebuildReports() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pv = rowsOf_(ss, 'Pageviews');
  var ev = rowsOf_(ss, 'Events');
  var se = rowsOf_(ss, 'Sensors');

  // R_Visitors — one row per visitor.
  var vis = {};
  pv.forEach(function (r) {
    var v = vis[r[2]] || (vis[r[2]] = { first: r[0], last: r[0], ips: {}, sessions: {}, pvs: 0, active: 0, clicks: 0, cta: 0, forms: 0, surveys: 0,
      geo: '', device: '', source: r[32] || r[33] || '(direct)' });
    v.last = r[0]; v.ips[r[6]] = 1; v.sessions[r[3]] = 1; v.pvs++;
    v.geo = [r[9], r[8], r[7]].filter(String).join(', '); v.device = r[19] + ' · ' + r[18] + ' · ' + r[17];
  });
  var pages = {};
  pv.forEach(function (r) {
    var p = pages[r[29]] || (pages[r[29]] = { pvs: 0, visitors: {}, active: 0, ends: 0, scroll: 0, clicks: 0, cta: 0, forms: 0 });
    p.pvs++; p.visitors[r[2]] = 1;
  });
  ev.forEach(function (r) {
    var v = vis[r[2]], p = pages[r[6]], type = r[8], d = r[18] ? safeJson_(r[18]) : {};
    if (type === 'click') { if (v) v.clicks++; if (p) p.clicks++; }
    if (type === 'cta_click') { if (v) v.cta++; if (p) p.cta++; }
    if (type === 'form_submit' && d.ok) { if (v) v.forms++; if (p) p.forms++; }
    if (type === 'survey_answer' && v) v.surveys++;
    if (type === 'page_end') {
      if (v) v.active += Number(d.activeMs) || 0;
      if (p) { p.active += Number(d.activeMs) || 0; p.scroll += Number(d.maxScrollPct) || 0; p.ends++; }
    }
  });
  writeReport_(ss, 'R_Visitors',
    ['Visitor ID', 'Lần đầu', 'Lần cuối', 'IP', 'Vị trí', 'Thiết bị', 'Nguồn đầu tiên', 'Số phiên', 'Lượt xem trang',
      'Thời gian tương tác (phút)', 'Click', 'Bấm CTA (gọi/Zalo/đặt lịch)', 'Gửi form thành công', 'Câu trả lời khảo sát'],
    Object.keys(vis).map(function (id) {
      var v = vis[id];
      return [id, v.first, v.last, Object.keys(v.ips).join(', '), v.geo, v.device, v.source, Object.keys(v.sessions).length, v.pvs,
        Math.round(v.active / 600) / 100, v.clicks, v.cta, v.forms, v.surveys];
    }));
  writeReport_(ss, 'R_Pages',
    ['Đường dẫn', 'Lượt xem', 'Khách duy nhất', 'TB thời gian tương tác (giây)', 'TB độ cuộn (%)', 'Click', 'Bấm CTA', 'Gửi form', 'Tỷ lệ chuyển đổi (%)'],
    Object.keys(pages).map(function (path) {
      var p = pages[path], u = Object.keys(p.visitors).length;
      return [path, p.pvs, u, p.ends ? Math.round(p.active / p.ends / 1000) : 0, p.ends ? Math.round(p.scroll / p.ends) : 0,
        p.clicks, p.cta, p.forms, u ? Math.round((p.forms / u) * 1000) / 10 : 0];
    }).sort(function (a, b) { return b[1] - a[1]; }));

  // R_Sensors — every 1 cm sensor aggregated.
  var agg = {};
  se.forEach(function (r) {
    var k = r[5] + '|' + r[6] + '|' + r[7];
    var a = agg[k] || (agg[k] = { path: r[5], layout: r[6], id: r[7], row: r[8], col: r[9], hover: 0, moves: 0, clicks: 0, s: {} });
    a.hover += Number(r[10]) || 0; a.moves += Number(r[11]) || 0; a.clicks += Number(r[12]) || 0; a.s[r[2]] = 1;
  });
  var aggRows = Object.keys(agg).map(function (k) {
    var a = agg[k];
    return [a.path, a.layout, a.id, a.row, a.col, a.hover, a.moves, a.clicks, Object.keys(a.s).length];
  });
  writeReport_(ss, 'R_Sensors', ['Đường dẫn', 'Layout', 'Sensor ID', 'Hàng (cm)', 'Cột (cm)', 'Rê chuột (ms)', 'Di chuột', 'Click', 'Số phiên chạm'], aggRows);

  buildHeatmapTabs_(ss, agg);
}

/** One sheet tab per busiest page+layout: each spreadsheet cell = one 1 cm sensor. */
function buildHeatmapTabs_(ss, agg) {
  ss.getSheets().forEach(function (sh) { if (/^HM /.test(sh.getName())) ss.deleteSheet(sh); });
  var groups = {};
  Object.keys(agg).forEach(function (k) {
    var a = agg[k], g = a.path + '|' + a.layout;
    var grp = groups[g] || (groups[g] = { path: a.path, layout: a.layout, cells: [], weight: 0 });
    var score = a.clicks * 5 + Math.round(a.hover / 1000); // 1 click ≈ 5 s of hover
    grp.cells.push([a.row, a.col, score]);
    grp.weight += score;
  });
  var top = Object.keys(groups).map(function (k) { return groups[k]; })
    .sort(function (a, b) { return b.weight - a.weight; }).slice(0, 8);

  top.forEach(function (g, i) {
    var maxR = 0, maxC = 0;
    g.cells.forEach(function (c) { maxR = Math.max(maxR, c[0]); maxC = Math.max(maxC, c[1]); });
    maxR = Math.min(maxR, 399); maxC = Math.min(maxC, 59);
    var grid = [];
    for (var r = 0; r <= maxR; r++) { grid.push(new Array(maxC + 1).fill('')); }
    g.cells.forEach(function (c) { if (c[0] <= maxR && c[1] <= maxC) grid[c[0]][c[1]] = (grid[c[0]][c[1]] || 0) + c[2]; });

    var name = ('HM ' + (i + 1) + ' ' + g.layout + ' ' + g.path).slice(0, 90);
    var sh = ss.insertSheet(name);
    sh.getRange(1, 1).setValue('Heatmap 1 cm — ' + g.path + ' (' + g.layout + '). Mỗi ô = 1 sensor 1×1 cm. Điểm = click×5 + giây rê chuột.');
    var header = [''];
    for (var c = 0; c <= maxC; c++) header.push(c);
    sh.getRange(2, 1, 1, header.length).setValues([header]).setFontSize(7);
    var body = grid.map(function (row, r) { return [r].concat(row); });
    var range = sh.getRange(3, 2, body.length, maxC + 1);
    sh.getRange(3, 1, body.length, maxC + 2).setValues(body).setFontSize(7).setHorizontalAlignment('center');
    sh.setColumnWidths(1, maxC + 2, 22);
    sh.setRowHeights(3, body.length, 22);
    sh.setFrozenRows(2);
    sh.setFrozenColumns(1);
    var rule = SpreadsheetApp.newConditionalFormatRule()
      .setGradientMinpointWithValue('#dbe7fd', SpreadsheetApp.InterpolationType.NUMBER, '0')
      .setGradientMidpointWithValue('#f0c069', SpreadsheetApp.InterpolationType.PERCENTILE, '60')
      .setGradientMaxpointWithValue('#c7452f', SpreadsheetApp.InterpolationType.MAX, '')
      .setRanges([range]).build();
    sh.setConditionalFormatRules([rule]);
  });
}

// ───────────────────────── data dictionary ─────────────────────────

function writeDictionary_(ss) {
  var rows = [
    ['Nhóm', 'Dữ liệu', 'Ý nghĩa / dùng để làm gì', 'Thu ở đâu', 'Tab'],
    ['Định danh', 'Visitor ID', 'Mã ngẫu nhiên cho 1 trình duyệt (lưu localStorage) — nhận ra khách quay lại', 'Trình duyệt', 'Mọi tab'],
    ['Định danh', 'Session ID', 'Phiên truy cập; hết hạn sau 30 phút không thao tác', 'Trình duyệt', 'Mọi tab'],
    ['Định danh', 'Pageview ID', 'Mỗi lần mở 1 trang', 'Trình duyệt', 'Mọi tab'],
    ['Mạng & vị trí', 'IP', 'Địa chỉ IP thật của khách (Cloudflare CF-Connecting-IP)', 'Máy chủ', 'Pageviews, Events, Sensors'],
    ['Mạng & vị trí', 'Quốc gia, Tỉnh/Vùng, Thành phố, Mã bưu chính, Vĩ độ/Kinh độ', 'Vị trí ước tính từ IP (độ chính xác cấp thành phố, KHÔNG phải GPS)', 'Máy chủ (Cloudflare)', 'Pageviews'],
    ['Mạng & vị trí', 'ASN, Nhà mạng/ISP, Cloudflare PoP', 'Mạng di động/cáp quang khách dùng (Viettel, FPT, VNPT…)', 'Máy chủ', 'Pageviews'],
    ['Thiết bị', 'User-Agent, Trình duyệt, Hệ điều hành, Thiết bị', 'Máy tính / điện thoại / máy tính bảng, Chrome/Safari/Zalo browser…', 'Máy chủ + phân tích UA', 'Pageviews'],
    ['Thiết bị', 'Viewport, Màn hình, DPR, Cảm ứng, Mạng (4g/3g)', 'Kích thước cửa sổ & màn hình, mật độ điểm ảnh, tốc độ mạng ước tính', 'Trình duyệt', 'Pageviews'],
    ['Thiết bị', 'Layout', 'desktop (≥1024px) / tablet (≥640px) / mobile — heatmap chỉ so sánh trong cùng layout', 'Trình duyệt', 'Mọi tab'],
    ['Ngôn ngữ', 'Ngôn ngữ, Accept-Language, Múi giờ', 'Ngôn ngữ trình duyệt và múi giờ máy khách', 'Trình duyệt + máy chủ', 'Pageviews'],
    ['Nguồn truy cập', 'Referrer, utm_source/medium/campaign/term/content, gclid, fbclid', 'Khách đến từ Google, Facebook, Zalo, quảng cáo nào', 'URL', 'Pageviews'],
    ['Lướt web', 'page_view', 'Mở một trang (gồm điều hướng trong site)', 'Trình duyệt', 'Pageviews, Events'],
    ['Lướt web', 'page_end: totalMs, activeMs, maxScrollPct, clicks, moves', 'Thời gian ở trang (tổng và thời gian thật sự tương tác), độ cuộn sâu nhất, số click', 'Trình duyệt', 'Events'],
    ['Lướt web', 'scroll_depth 25/50/75/100', 'Mốc cuộn trang', 'Trình duyệt', 'Events'],
    ['Lướt web', 'visibility hidden/visible', 'Chuyển tab / quay lại', 'Trình duyệt', 'Events'],
    ['Lướt web', 'Tải trang (ms)', 'Tốc độ tải trang đầu tiên', 'Trình duyệt', 'Pageviews'],
    ['Click', 'click: x, y, hàng, cột, sensor, thẻ, nhãn, link', 'Mọi cú click/chạm, vị trí pixel và ô 1 cm, nút/link nào', 'Trình duyệt', 'Events, Sensors'],
    ['Click', 'cta_click (call / zalo / email / booking / contact)', 'Bấm Gọi, Zalo, Email, Đặt lịch, Liên hệ', 'Trình duyệt', 'Events'],
    ['Click', 'outbound_click', 'Bấm link ra trang ngoài', 'Trình duyệt', 'Events'],
    ['Click', 'rage_click', '3 click liên tiếp vào cùng 1 cm trong 0,8 giây — dấu hiệu khách bực/nút không phản hồi', 'Trình duyệt', 'Events'],
    ['Sensor 1 cm', 'Sensor ID r{hàng}c{cột}', 'Mỗi ô 1×1 cm tính từ góc trên-trái trang (1 cm = 37,8 px CSS)', 'Trình duyệt', 'Sensors, R_Sensors, HM'],
    ['Sensor 1 cm', 'Rê chuột (ms), Số lần di chuột, Số click', 'Thời gian con trỏ nằm trong ô, số lần di qua, số click trong ô', 'Trình duyệt', 'Sensors'],
    ['Sensor 1 cm', 'Attention: thời gian trong màn hình theo hàng 1 cm', 'Mỗi dải ngang 1 cm được nhìn thấy bao lâu (heatmap độ chú ý/cuộn)', 'Trình duyệt', 'Attention'],
    ['Form & đơn hàng', 'form_start', 'Khách bắt đầu điền form nào (KHÔNG ghi nội dung gõ)', 'Trình duyệt', 'Events'],
    ['Form & đơn hàng', 'form_submit (booking / contact / freedom_calculator / diagnostic) + ok', 'Gửi form thành công hay lỗi — đây là "đơn" của website dịch vụ', 'Component form', 'Events'],
    ['Form & đơn hàng', 'calculator_change', 'Công cụ Tính giờ: số giờ/tuần và mức giá trị giờ khách chọn', 'Component', 'Events'],
    ['Khảo sát', 'survey_start, survey_answer (câu, lựa chọn, điểm), survey_complete (điểm, điểm nghẽn)', 'Công cụ Chẩn đoán hệ thống trên trang Dịch vụ', 'Component', 'Events'],
    ['Khác', 'copy', 'Khách copy chữ (vd. số điện thoại) — tối đa 60 ký tự', 'Trình duyệt', 'Events'],
    ['Khác', 'js_error', 'Lỗi kỹ thuật trên trình duyệt khách — để sửa lỗi', 'Trình duyệt', 'Events'],
    ['Báo cáo', 'R_Visitors / R_Pages / R_Sensors / HM …', 'Tổng hợp tự động mỗi giờ (hoặc menu 📊 Tracking)', 'Apps Script', '—'],
    ['KHÔNG thu', 'Nội dung khách gõ, mật khẩu, số thẻ, vân tay thiết bị ẩn', 'Không cần cho phân tích và vi phạm quyền riêng tư; tên/SĐT chỉ đến qua email khi khách tự gửi form', '—', '—'],
    ['Pháp lý', 'Đồng ý (consent)', 'Chỉ ghi nhận sau khi khách bấm "Đồng ý" trên banner (Luật Bảo vệ dữ liệu cá nhân 2025 / NĐ 13/2023). Từ chối = không ghi gì.', 'Banner', '—'],
  ];
  var sh = ss.getSheetByName('Data_Dictionary') || ss.insertSheet('Data_Dictionary', 0);
  sh.clear();
  sh.getRange(1, 1, rows.length, 5).setValues(rows).setWrap(true).setVerticalAlignment('top');
  sh.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#0b1220').setFontColor('#f0c069');
  sh.setColumnWidth(1, 120); sh.setColumnWidth(2, 280); sh.setColumnWidth(3, 420); sh.setColumnWidth(4, 140); sh.setColumnWidth(5, 160);
  sh.setFrozenRows(1);
}

// ───────────────────────── helpers ─────────────────────────

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function append_(name, rows) {
  if (!rows.length) return;
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function rowsOf_(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
}

function writeReport_(ss, name, header, rows) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear();
  sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold').setBackground('#0b1220').setFontColor('#f0c069');
  if (rows.length) sh.getRange(2, 1, rows.length, header.length).setValues(rows);
  sh.setFrozenRows(1);
}

function vnTime_(v) {
  var d = typeof v === 'number' ? new Date(v) : new Date(v || Date.now());
  return Utilities.formatDate(d, TZ, 'yyyy-MM-dd HH:mm:ss');
}

function safeJson_(s) {
  try { return JSON.parse(s); } catch (e) { return {}; }
}

function parseUA_(ua) {
  var browser = /Zalo/i.test(ua) ? 'Zalo' : /FBAN|FBAV/i.test(ua) ? 'Facebook in-app' : /Edg\//.test(ua) ? 'Edge'
    : /CocCoc/i.test(ua) ? 'Cốc Cốc' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Khác';
  var os = /Windows/i.test(ua) ? 'Windows' : /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : /Android/i.test(ua) ? 'Android'
    : /Mac OS X/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : 'Khác';
  var device = /iPad|Tablet/i.test(ua) ? 'Tablet' : /Mobi|iPhone|Android/i.test(ua) ? 'Mobile' : 'Desktop';
  if (/bot|crawl|spider|slurp|headless/i.test(ua)) device = 'Bot';
  return { browser: browser, os: os, device: device };
}
