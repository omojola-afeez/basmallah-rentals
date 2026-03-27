// BASMALLAH RENTALS — Complete Application v4.1
// Fixes: catalog render, WhatsApp-only booking, localStorage persistence, back buttons
// ════════════════════════════════════════════════

// CONFIG
const WA_NUM   = '2348124038496';
const WA_NUM2  = '2348063726650';
const ADMIN_EMAIL = 'info@basmallahrentals.ng';
let   ADMIN_PW = 'basmallah2025';

// IMAGES
const EQUIP_IMGS = {};
var newImgData = null;
var EQUIP_IMG_MAP = {};

// ════════════════════════════════════════════════
// DATA — persisted to localStorage
// ════════════════════════════════════════════════
var DEFAULT_EQUIPMENT = [
  { id:1, name:'White Monobloc', cat:'Chairs', price:100, stock:50, unit:'pcs', icon:'🪑', desc:'Budget-friendly plastic chair, perfect for outdoor events.', badge:'new' },
  { id:2, name:'Executive Cushion', cat:'Chairs', price:250, stock:30, unit:'pcs', icon:'🪑', desc:'Premium cushion chair for VIP sections.', badge:'' }
];

var bookings  = [];
var equipment = [];
var enquiries = [];
var cart = {};
var chatHist = [];
var chatOpen = false;

function loadData() {
  try {
    var eq = localStorage.getItem('br_equipment');
    equipment = eq ? JSON.parse(eq) : JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT));
    equipment.forEach(function(e) {
      if (e.customImg) {
        EQUIP_IMGS['__c' + e.id] = e.customImg;
        EQUIP_IMG_MAP[e.id]      = '__c' + e.id;
      }
    });
  } catch(e) { equipment = JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT)); }
  try { var bk  = localStorage.getItem('br_bookings');  bookings  = bk  ? JSON.parse(bk)  : []; } catch(e) { bookings  = []; }
  try { var enq = localStorage.getItem('br_enquiries'); enquiries = enq ? JSON.parse(enq) : []; } catch(e) { enquiries = []; }
}

function saveEquipment() { try { localStorage.setItem('br_equipment', JSON.stringify(equipment)); } catch(e) {} }
function saveBookings()  { try { localStorage.setItem('br_bookings',  JSON.stringify(bookings));  } catch(e) {} }
function saveEnquiries() { try { localStorage.setItem('br_enquiries', JSON.stringify(enquiries)); } catch(e) {} }

loadData();

// ════════════════════════════════════════════════
// NAVIGATION — with back stack
// ════════════════════════════════════════════════
var _navStack = [];

function goto(page) {
  var current = null;
  document.querySelectorAll('.page').forEach(function(p) {
    if (p.classList.contains('active')) current = p.id.replace('page-', '');
    p.classList.remove('active');
  });
  if (current && current !== page) _navStack.push(current);
  var p = document.getElementById('page-' + page);
  if (p) p.classList.add('active');
  closeMob();
  window.scrollTo(0, 0);
}

function goBack() {
  var prev = _navStack.pop();
  if (prev) {
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    var p = document.getElementById('page-' + prev);
    if (p) p.classList.add('active');
    window.scrollTo(0, 0);
  } else {
    goto('home');
  }
}

function toggleMob() { document.getElementById('mob-menu').classList.toggle('open'); }
function closeMob()  { document.getElementById('mob-menu').classList.remove('open'); }

// ════════════════════════════════════════════════
// CATALOG & RENDERING
// ════════════════════════════════════════════════
function renderCatalog() {
  var con = document.getElementById('catalog-grid');
  if (!con) return;
  var cats = {};
  equipment.forEach(function(e) { if (!cats[e.cat]) cats[e.cat] = []; cats[e.cat].push(e); });
  var html = Object.keys(cats).map(function(cat) {
    return '<div class="cat-sec">'
      + '<h3>' + cat + '</h3>'
      + '<div class="eq-grid">'
      + cats[cat].map(function(e) {
        var src = getImgSrc(e);
        return '<div class="eq-card" onclick="openModal(' + e.id + ')">'
          + (src ? '<img src="' + src + '" alt="' + e.name + '" style="width:100%;height:150px;object-fit:cover;border-radius:8px;">'
                 : '<div style="width:100%;height:150px;background:var(--gp);display:flex;align-items:center;justify-content:center;font-size:2rem;border-radius:8px;">' + e.icon + '</div>')
          + '<strong>' + e.name + '</strong><br>'
          + '<span style="color:var(--gd);">₦' + e.price + '/' + e.unit + '</span><br>'
          + (e.badge ? '<span class="badge badge-' + e.badge + '">' + e.badge.toUpperCase() + '</span>' : '')
          + '</div>';
      }).join('')
      + '</div></div>';
  }).join('');
  con.innerHTML = html || '<p style="text-align:center;color:var(--tmu);padding:2rem;">No equipment yet. Add items in the admin panel.</p>';
}

function getImgSrc(e) {
  if (e.customImg) return e.customImg;
  var key = EQUIP_IMG_MAP[e.id];
  return key && EQUIP_IMGS[key] ? EQUIP_IMGS[key] : null;
}

function renderFeatured() {
  var con = document.getElementById('feat-grid');
  if (!con) return;
  con.innerHTML = equipment.slice(0, 4).map(function(e) {
    var src = getImgSrc(e);
    return '<div class="feat-card" onclick="openModal(' + e.id + ')">'
      + (src ? '<img src="' + src + '" alt="' + e.name + '">'
             : '<div style="width:100%;height:200px;background:var(--gp);display:flex;align-items:center;justify-content:center;font-size:3rem;">' + e.icon + '</div>')
      + '<h4>' + e.name + '</h4>'
      + '<p>₦' + e.price + '/' + e.unit + '</p>'
      + '<button class="btn btn-grn" onclick="event.stopPropagation(); openModal(' + e.id + '); return false;">Add</button>'
      + '</div>';
  }).join('');
}

function renderGallery() {
  var con = document.getElementById('gallery-grid');
  if (!con) return;
  con.innerHTML = equipment.slice(0, 8).map(function(e) {
    var src = getImgSrc(e);
    var span = (e.id % 3 === 0) ? ' style="grid-row:span 2;"' : '';
    return '<div class="gallery-item"' + span + '>'
      + (src ? '<img src="' + src + '" alt="' + e.name + '">'
             : '<div style="width:100%;height:100%;background:var(--gp);display:flex;align-items:center;justify-content:center;font-size:2rem;">' + e.icon + '</div>')
      + '</div>';
  }).join('');
}

// ════════════════════════════════════════════════
// MODAL & ITEM MANAGEMENT
// ════════════════════════════════════════════════
var currentModalItem = null;

function openModal(id) {
  currentModalItem = equipment.find(function(e) { return e.id === id; });
  if (!currentModalItem) return;
  var m = document.getElementById('item-modal');
  if (m) {
    var src = getImgSrc(currentModalItem);
    m.querySelector('.modal-img').innerHTML = src
      ? '<img src="' + src + '" style="width:100%;border-radius:8px;">'
      : '<div style="width:100%;height:200px;background:var(--gp);display:flex;align-items:center;justify-content:center;font-size:3rem;border-radius:8px;">' + currentModalItem.icon + '</div>';
    m.querySelector('.modal-title').textContent = currentModalItem.name;
    m.querySelector('.modal-price').textContent = '₦' + currentModalItem.price + '/' + currentModalItem.unit;
    m.querySelector('.modal-desc').textContent  = currentModalItem.desc;
    m.querySelector('.item-qty').value = cart[currentModalItem.id] || 1;
    m.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  var m = document.getElementById('item-modal');
  if (m) { m.classList.remove('active'); document.body.style.overflow = ''; currentModalItem = null; }
}

function chgQty(delta) {
  var inp = document.querySelector('.item-qty');
  if (inp) inp.value = Math.max(1, parseInt(inp.value) + delta);
}

function addToOrder() {
  if (!currentModalItem) return;
  cart[currentModalItem.id] = parseInt(document.querySelector('.item-qty').value) || 1;
  renderOrder(); updatePriceBox(); closeModal();
  toast('✅ Added to booking!', 'ok');
}

function removeFromOrder(id) { delete cart[id]; renderOrder(); updatePriceBox(); }

function updateQty(id, qty) {
  if (qty <= 0) removeFromOrder(id);
  else cart[id] = qty;
  updatePriceBox();
}

function renderOrder() {
  var con = document.getElementById('order-items');
  if (!con) return;
  con.innerHTML = Object.keys(cart).map(function(eid) {
    var e = equipment.find(function(x) { return x.id == eid; });
    if (!e) return '';
    return '<tr>'
      + '<td><strong>' + e.name + '</strong><br><small style="color:var(--tmu);">' + e.unit + '</small></td>'
      + '<td>₦' + e.price + '</td>'
      + '<td><input type="number" min="1" value="' + cart[eid] + '" style="width:50px;" onchange="updateQty(' + eid + ',+this.value); renderOrder();"></td>'
      + '<td style="font-weight:bold;">₦' + (e.price * cart[eid]) + '</td>'
      + '<td><button class="act-btn" onclick="removeFromOrder(' + eid + ')">Remove</button></td>'
      + '</tr>';
  }).join('');
}

function updatePriceBox() {
  var total = 0;
  Object.keys(cart).forEach(function(eid) {
    var e = equipment.find(function(x) { return x.id == eid; });
    if (e) total += e.price * cart[eid];
  });
  var pb = document.getElementById('price-box');
  if (pb) {
    pb.querySelector('.total-price').textContent = '₦' + total;
    pb.querySelector('.items-count').textContent = Object.keys(cart).length;
  }
}

// ════════════════════════════════════════════════
// BOOKING — both buttons go to WhatsApp
// ════════════════════════════════════════════════
function getForm() {
  return {
    fn:      (document.getElementById('b-fn')     || {}).value || '',
    ln:      (document.getElementById('b-ln')     || {}).value || '',
    phone:   (document.getElementById('b-phone')  || {}).value || '',
    email:   (document.getElementById('b-email')  || {}).value || '',
    evtype:  (document.getElementById('b-evtype') || {}).value || '',
    date:    (document.getElementById('b-date')   || {}).value || '',
    dur:     (document.getElementById('b-dur')    || {}).value || '',
    venue:   (document.getElementById('b-venue')  || {}).value || '',
    guests:  (document.getElementById('b-guests') || {}).value || '',
    notes:   (document.getElementById('b-notes')  || {}).value || '',
    platform:(document.querySelector('input[name="platform"]:checked') || {}).value || ''
  };
}

function validateForm(f) {
  if (!f.fn || !f.phone || !f.evtype || !f.date || !f.venue || !f.platform) {
    toast('Please fill in all required fields', 'err');
    return false;
  }
  return true;
}

function buildItemList() {
  return Object.keys(cart).map(function(eid) {
    var e = equipment.find(function(x) { return x.id == eid; });
    return e ? cart[eid] + 'x ' + e.name : null;
  }).filter(Boolean).join(', ') || 'No items selected';
}

// Both Submit Booking and Confirm via WhatsApp go here
function submitBooking() { bookWA(); }

function bookWA() {
  var f = getForm();
  if (!validateForm(f)) return;
  var id = bookings.length + 1;
  bookings.unshift({
    id:id, fn:f.fn, ln:f.ln, phone:f.phone, email:f.email,
    evtype:f.evtype, date:f.date, dur:f.dur, venue:f.venue,
    guests:f.guests, notes:f.notes, platform:f.platform,
    items:buildItemList(), status:'pending'
  });
  saveBookings();
  var msg = 'Assalamu alaykum! 🌙\n\nI\'d like to book from *Basmallah Rentals*:\n\n'
    + '👤 *Name:* ' + f.fn + ' ' + f.ln + '\n'
    + '📞 *Phone:* ' + f.phone + '\n'
    + '🎉 *Event:* ' + f.evtype + '\n'
    + '📅 *Date:* ' + f.date + ' (' + f.dur + ')\n'
    + '📍 *Venue:* ' + f.venue + '\n'
    + '👥 *Guests:* ' + f.guests + '\n'
    + '🛒 *Equipment:* ' + buildItemList() + '\n'
    + '📱 *Via:* ' + f.platform + '\n'
    + '📝 *Notes:* ' + (f.notes || 'None') + '\n\n'
    + 'Please confirm availability and pricing. Thank you!';
  openWA(msg);
  cart = {};
  renderOrder();
  updatePriceBox();
}

// ════════════════════════════════════════════════
// CONTACT FORM
// ════════════════════════════════════════════════
function sendContact() {
  function g(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  var fn=g('c-fn'), ln=g('c-ln'), em=g('c-email'), ph=g('c-phone'), sb=g('c-subj'), mg=g('c-msg');
  if (!fn || !sb || !mg) { toast('Please fill in name, subject and message', 'err'); return; }
  enquiries.unshift({ id:enquiries.length+1, fn:fn, ln:ln, email:em, phone:ph, subj:sb, msg:mg, date:new Date().toISOString().split('T')[0] });
  saveEnquiries();
  sendEmail({ to_name:fn+' '+ln, to_email:em||ADMIN_EMAIL, subject:sb, message:mg, phone:ph });
  ['c-fn','c-ln','c-email','c-phone','c-subj','c-msg'].forEach(function(id) { var el=document.getElementById(id); if(el) el.value=''; });
  toast('✅ Message sent! We\'ll reply within 2 hours.', 'ok');
}

// ════════════════════════════════════════════════
// ADMIN AUTH
// ════════════════════════════════════════════════
function adminLogin() {
  if (sessionStorage.getItem('br_auth') === '1') { showDash(); return; }
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  var ap = document.getElementById('page-admin');
  if (ap) ap.classList.add('active');
  var gate = document.getElementById('admin-gate');
  var dash = document.getElementById('admin-dash');
  if (gate) gate.style.display = 'flex';
  if (dash) dash.style.display = 'none';
  var ft = document.getElementById('site-footer');
  var sb = document.getElementById('sticky-bar');
  if (ft) ft.style.display = 'none';
  if (sb) sb.style.display = 'none';
  closeMob(); window.scrollTo(0, 0);
  setTimeout(function() { var inp = document.getElementById('admin-pw'); if (inp) inp.focus(); }, 150);
}

function checkPw() {
  var inp = document.getElementById('admin-pw');
  var errEl = document.getElementById('pw-error');
  if (!inp) return;
  if (inp.value === ADMIN_PW) {
    sessionStorage.setItem('br_auth', '1');
    inp.value = '';
    if (errEl) errEl.style.display = 'none';
    showDash();
  } else {
    if (errEl) errEl.style.display = 'block';
    inp.value = ''; inp.focus();
    inp.style.animation = 'shake .4s ease';
    setTimeout(function() { inp.style.animation = ''; }, 400);
  }
}

function showDash() {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  var ap = document.getElementById('page-admin');
  if (ap) ap.classList.add('active');
  var gate = document.getElementById('admin-gate');
  var dash = document.getElementById('admin-dash');
  if (gate) gate.style.display = 'none';
  if (dash) dash.style.display = 'block';
  var ft = document.getElementById('site-footer');
  var sb = document.getElementById('sticky-bar');
  if (ft) ft.style.display = 'none';
  if (sb) sb.style.display = 'none';
  renderAdmin(); window.scrollTo(0, 0);
}

function adminLogout() {
  sessionStorage.removeItem('br_auth');
  goto('home');
  toast('Signed out successfully', 'ok');
}

function changePw() {
  var curr = document.getElementById('pw-curr');
  var nw   = document.getElementById('pw-new');
  var cf   = document.getElementById('pw-conf');
  var msgEl= document.getElementById('pw-msg');
  function showMsg(msg, ok) {
    if (!msgEl) return;
    msgEl.style.display = 'block';
    msgEl.style.background = ok ? '#d4edda' : '#f8d7da';
    msgEl.style.color = ok ? '#155724' : '#721c24';
    msgEl.textContent = msg;
    setTimeout(function() { if (msgEl) msgEl.style.display = 'none'; }, 4000);
  }
  if (!curr || curr.value !== ADMIN_PW) { showMsg('❌ Current password is incorrect.', false); return; }
  if (!nw || nw.value.length < 6)       { showMsg('❌ New password must be at least 6 characters.', false); return; }
  if (!cf || nw.value !== cf.value)      { showMsg('❌ Passwords do not match.', false); return; }
  ADMIN_PW = nw.value;
  showMsg('✅ Password updated for this session!', true);
  [curr, nw, cf].forEach(function(el) { if (el) el.value = ''; });
}

// ════════════════════════════════════════════════
// ADMIN RENDER
// ════════════════════════════════════════════════
function showTab(t) {
  document.querySelectorAll('.admin-tab').forEach(function(el) { el.classList.remove('active'); });
  document.querySelectorAll('.admin-link').forEach(function(l) { l.classList.remove('active'); });
  var tab = document.getElementById('atab-' + t);
  if (tab) tab.classList.add('active');
  var tLabel = t === 'dash' ? 'dashboard' : t === 'add' ? 'add' : t;
  document.querySelectorAll('.admin-link').forEach(function(l) {
    var txt = l.textContent.toLowerCase();
    if (txt.indexOf(tLabel.slice(0,4)) !== -1 || txt.indexOf(t) !== -1) l.classList.add('active');
  });
  renderAdmin();
}

function renderAdmin() {
  var pending = bookings.filter(function(b) { return b.status === 'pending'; }).length;
  var pd = document.getElementById('pd');
  if (pd) pd.style.display = pending > 0 ? 'inline-block' : 'none';
  setEl('k-bk', bookings.length); setEl('k-pd', pending);
  setEl('k-eq', equipment.length); setEl('k-enq', enquiries.length);

  var dtb = document.getElementById('tb-dash');
  if (dtb) dtb.innerHTML = bookings.slice(0,6).map(function(b) {
    return '<tr><td>' + b.fn + ' ' + b.ln + '</td><td>' + b.evtype + '</td><td>' + b.date + '</td>'
      + '<td style="font-size:.75rem;">' + b.platform + '</td>'
      + '<td><span class="badge badge-' + b.status + '">' + b.status + '</span></td>'
      + '<td><button class="act-btn success" onclick="confirmBk(' + b.id + ')">✓ Confirm</button>'
      + '<button class="act-btn" onclick="contactBk(' + b.id + ')">💬</button></td></tr>';
  }).join('');

  var btb = document.getElementById('tb-bk');
  if (btb) btb.innerHTML = bookings.map(function(b) {
    return '<tr><td>#BK' + b.id + '</td><td>' + b.fn + ' ' + b.ln + '</td><td>' + b.phone + '</td>'
      + '<td>' + b.evtype + '</td><td>' + b.date + '</td><td>' + b.venue + '</td>'
      + '<td>' + (b.guests||'—') + '</td><td>' + b.platform + '</td>'
      + '<td style="max-width:120px;font-size:.75rem;">' + (b.items||'—') + '</td>'
      + '<td><span class="badge badge-' + b.status + '">' + b.status + '</span></td>'
      + '<td style="white-space:nowrap;">'
      + '<button class="act-btn success" onclick="confirmBk(' + b.id + ')">✓</button>'
      + '<button class="act-btn" onclick="contactBk(' + b.id + ')">💬</button>'
      + '<button class="act-btn danger" onclick="cancelBk(' + b.id + ')">✕</button></td></tr>';
  }).join('');

  var etb = document.getElementById('tb-eq');
  if (etb) etb.innerHTML = equipment.map(function(e) {
    var src = getImgSrc(e);
    var thumb = src
      ? '<img src="' + src + '" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid var(--bdr);vertical-align:middle;margin-right:6px;">'
      : '<span style="font-size:1.2rem;margin-right:5px;">' + e.icon + '</span>';
    return '<tr>'
      + '<td style="vertical-align:middle;">' + thumb + '<strong>' + e.name + '</strong><br><span style="font-size:.7rem;color:var(--tmu);">' + e.cat + '</span></td>'
      + '<td><div style="display:flex;align-items:center;gap:4px;">₦<input type="number" value="' + e.price + '" min="0" style="width:82px;border:1px solid var(--bdr);border-radius:6px;padding:4px 6px;font-size:.83rem;" onchange="updEq(' + e.id + ',\'price\',+this.value)"><span style="font-size:.7rem;color:var(--tmu);">' + e.unit + '</span></div></td>'
      + '<td><input type="number" value="' + (e.stock||0) + '" min="0" style="width:62px;border:1px solid var(--bdr);border-radius:6px;padding:4px 6px;font-size:.83rem;" onchange="updEq(' + e.id + ',\'stock\',+this.value)"></td>'
      + '<td><span class="badge badge-active">Active</span></td>'
      + '<td style="white-space:nowrap;"><label class="act-btn" style="cursor:pointer;">📷 Photo<input type="file" accept="image/*" style="display:none;" onchange="updEqImg(' + e.id + ',this)"></label>'
      + '<button class="act-btn danger" onclick="delEq(' + e.id + ')">✕</button></td></tr>';
  }).join('');

  var enqtb = document.getElementById('tb-enq');
  if (enqtb) enqtb.innerHTML = enquiries.map(function(e) {
    return '<tr><td>' + e.fn + ' ' + e.ln + '</td><td>' + (e.email||'—') + '</td><td>' + (e.phone||'—') + '</td>'
      + '<td>' + e.subj + '</td><td>' + e.date + '</td>'
      + '<td><button class="act-btn" onclick="replyEnq(\'' + (e.email||'') + '\',\'' + e.subj + '\')">Reply</button>'
      + '<button class="act-btn" onclick="openWA(\'Assalamu alaykum ' + e.fn + '! Basmallah Rentals regarding: ' + e.subj + '\')">💬</button></td></tr>';
  }).join('');
}

function setEl(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
function confirmBk(id) { var b=bookings.find(function(x){return x.id===id;}); if(b){b.status='confirmed'; saveBookings(); renderAdmin(); toast('✅ Booking #BK'+id+' confirmed','ok');} }
function cancelBk(id)  { var b=bookings.find(function(x){return x.id===id;}); if(b){b.status='cancelled'; saveBookings(); renderAdmin(); toast('Booking cancelled','err');} }
function contactBk(id) { var b=bookings.find(function(x){return x.id===id;}); if(b) openWA('Assalamu alaykum '+b.fn+'! Basmallah Rentals here about your booking for '+b.evtype+' on '+b.date+'.'); }
function replyEnq(email,subj) { window.location.href='mailto:'+email+'?subject=Re: '+subj+'&body=Assalamu alaykum,%0D%0A%0D%0AThank you for contacting Basmallah Rentals.%0D%0A%0D%0A'; }
function delEq(id) { equipment=equipment.filter(function(e){return e.id!==id;}); saveEquipment(); renderAdmin(); renderCatalog(); renderFeatured(); toast('Equipment removed','ok'); }
function updEq(id, field, val) { var e=equipment.find(function(x){return x.id===id;}); if(e){e[field]=val; saveEquipment(); toast('✅ '+e.name+' '+field+' updated','ok');} }

function exportCSV() {
  var hdr  = ['Ref','First','Last','Phone','Email','Event','Date','Duration','Venue','Guests','Platform','Items','Status','Notes'];
  var rows = bookings.map(function(b) {
    return ['#BK'+b.id,b.fn,b.ln,b.phone,b.email||'',b.evtype,b.date,b.dur||'1 Day',b.venue,b.guests||'',b.platform,(b.items||'').replace(/,/g,';'),b.status,(b.notes||'').replace(/,/g,';')];
  });
  var csv = [hdr].concat(rows).map(function(r){return r.map(function(c){return '"'+c+'"';}).join(',');}).join('\n');
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download = 'basmallah_bookings_'+new Date().toISOString().split('T')[0]+'.csv';
  a.click();
  toast('✅ Bookings exported!', 'ok');
}

// ════════════════════════════════════════════════
// IMAGE UPLOAD
// ════════════════════════════════════════════════
function prevImg(input) {
  if (!input.files || !input.files[0]) return;
  if (input.files[0].size > 5*1024*1024) { toast('Max 5MB', 'err'); return; }
  var r = new FileReader();
  r.onload = function(ev) {
    newImgData = ev.target.result;
    var prev=document.getElementById('ae-prev'), ph=document.getElementById('ae-ph'), zone=document.getElementById('ae-zone');
    if (prev) { prev.src=newImgData; prev.style.display='block'; }
    if (ph) ph.style.display='none';
    if (zone) zone.classList.add('has-img');
  };
  r.readAsDataURL(input.files[0]);
}

function clearImg() {
  newImgData = null;
  var prev=document.getElementById('ae-prev'), ph=document.getElementById('ae-ph'),
      zone=document.getElementById('ae-zone'), inp=document.getElementById('ae-file');
  if (prev) { prev.src=''; prev.style.display='none'; }
  if (ph) ph.style.display='block';
  if (zone) zone.classList.remove('has-img');
  if (inp) inp.value='';
}

function addEquip() {
  function g(id) { var el=document.getElementById(id); return el?el.value.trim():''; }
  var name=g('ae-name'), cat=g('ae-cat')||'General', price=parseInt(g('ae-price'))||0,
      stock=parseInt(g('ae-stock'))||0, unit=g('ae-unit')||'pcs',
      icon=g('ae-icon')||'📦', desc=g('ae-desc'), badge=g('ae-badge');
  if (!name)  { toast('Equipment name is required', 'err'); return; }
  if (!price) { toast('Unit price is required', 'err'); return; }
  var newId = Date.now();
  var item = { id:newId, name:name, cat:cat, price:price, stock:stock, unit:unit, icon:icon, desc:desc, badge:badge };
  if (newImgData) {
    item.customImg = newImgData;
    EQUIP_IMGS['__c'+newId] = newImgData;
    EQUIP_IMG_MAP[newId] = '__c'+newId;
  }
  equipment.unshift(item);
  saveEquipment();
  ['ae-name','ae-price','ae-stock','ae-icon','ae-desc'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
  clearImg();
  showTab('equipment');
  renderCatalog(); renderFeatured(); renderGallery();
  toast('✅ ' + name + ' added to catalog!', 'ok');
}

function updEqImg(equipId, input) {
  if (!input.files || !input.files[0]) return;
  if (input.files[0].size > 5*1024*1024) { toast('Max 5MB', 'err'); return; }
  var r = new FileReader();
  r.onload = function(ev) {
    var e = equipment.find(function(x) { return x.id === equipId; });
    if (e) {
      e.customImg = ev.target.result;
      EQUIP_IMGS['__c'+equipId] = e.customImg;
      EQUIP_IMG_MAP[equipId] = '__c'+equipId;
      saveEquipment();
      renderAdmin(); renderCatalog(); renderFeatured();
      toast('✅ Photo updated for ' + e.name, 'ok');
    }
  };
  r.readAsDataURL(input.files[0]);
}

// ════════════════════════════════════════════════
// CHATBOT
// ════════════════════════════════════════════════
var CHAT_SYS = 'You are the friendly booking assistant for Basmallah Rentals — an event equipment rental company in Irewolede, Ilorin, Kwara State, Nigeria. '
  + 'We rent chairs, tables, canopies, cooking pots, generators, linen and more. '
  + 'We deliver and set up at your venue in Ilorin. We confirm bookings within 2 hours via WhatsApp. '
  + 'Be warm, concise (2-3 sentences), use Islamic greetings occasionally. '
  + 'Guide customers to the booking form or WhatsApp (0812 403 8496) for immediate help. '
  + 'Prices are in Nigerian Naira (₦).';

async function sendChatMsg(msg) {
  addChatMsg(msg, 'user'); showTyping();
  chatHist.push({ role:'user', content:msg });
  try {
    var res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:300, system:CHAT_SYS, messages:chatHist.slice(-12) })
    });
    var data  = await res.json();
    var reply = (data.content && data.content[0] && data.content[0].text) || fallback(msg);
    chatHist.push({ role:'assistant', content:reply });
    removeTyping(); addChatMsg(reply, 'bot');
  } catch(err) { removeTyping(); addChatMsg(fallback(msg), 'bot'); }
}

function fallback(msg) {
  var m = msg.toLowerCase();
  if (m.indexOf('chair') !== -1) return 'We have White Monobloc (₦100), Executive Cushion (₦250) and Chiavari Gold (₦400) chairs. Click any to add to your booking! 🪑';
  if (m.indexOf('canopy') !== -1 || m.indexOf('tent') !== -1) return 'Standard 10×10 canopy at ₦8,000/unit, Large 20×40 at ₦25,000/unit. Steel frame, all sizes available. ⛺';
  if (m.indexOf('pot') !== -1 || m.indexOf('cook') !== -1) return 'Pots from ₦1,500 (50L) to ₦4,000 (300L). Gas cookers available too! 🍲';
  if (m.indexOf('price') !== -1 || m.indexOf('cost') !== -1) return 'Equipment starts from ₦100/chair. Browse our full catalog for all prices. 💰';
  if (m.indexOf('book') !== -1 || m.indexOf('order') !== -1) return 'Click any equipment → Add to list → Fill the booking form → Confirm via WhatsApp! 📋';
  if (m.indexOf('deliver') !== -1 || m.indexOf('setup') !== -1) return 'Yes! We deliver and set up everything at your venue in Ilorin. We collect after the event too. 🚚';
  if (m.indexOf('location') !== -1 || m.indexOf('address') !== -1) return 'We\'re based in Irewolede, Ilorin, Kwara State. We serve all of Ilorin! 📍';
  return 'Basmallah Rentals has chairs, tables, canopies, pots and more for your Ilorin event! Browse the catalog or WhatsApp us directly. 😊';
}

function addChatMsg(txt, type) {
  var box = document.getElementById('chat-msgs');
  if (!box) return;
  var div = document.createElement('div');
  div.className = 'cmsg ' + type; div.textContent = txt;
  box.appendChild(div); box.scrollTop = box.scrollHeight;
}
function showTyping() {
  var box = document.getElementById('chat-msgs');
  if (!box) return;
  var t = document.createElement('div');
  t.className = 'typing'; t.id = 'typing-dot';
  t.innerHTML = '<span></span><span></span><span></span>';
  box.appendChild(t); box.scrollTop = box.scrollHeight;
}
function removeTyping() { var t = document.getElementById('typing-dot'); if (t) t.remove(); }

function sendChat() {
  var inp = document.getElementById('chat-inp');
  if (!inp) return;
  var msg = inp.value.trim(); if (!msg) return;
  inp.value = '';
  var chips = document.getElementById('chat-chips'); if (chips) chips.style.display = 'none';
  sendChatMsg(msg);
}
function cs(msg) {
  var chips = document.getElementById('chat-chips'); if (chips) chips.style.display = 'none';
  addChatMsg(msg, 'user');
  setTimeout(function() { sendChatMsg(msg); }, 80);
}
function toggleChat() {
  chatOpen = !chatOpen;
  var win = document.getElementById('chat-win'), badge = document.getElementById('chat-badge');
  if (win) win.classList.toggle('open', chatOpen);
  if (badge) badge.style.display = 'none';
  if (chatOpen && document.getElementById('chat-msgs').children.length === 0) {
    setTimeout(function() { addChatMsg('Assalamu alaykum! 🌙 Welcome to Basmallah Rentals. How can I help with your event today?', 'bot'); }, 350);
  }
}

// ════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════
function openWA(msg, num) {
  window.open('https://wa.me/' + (num || WA_NUM) + '?text=' + encodeURIComponent(msg), '_blank');
}
function sendEmail(params) {
  if (window.emailjs) { emailjs.send('YOUR_SERVICE_ID','YOUR_TEMPLATE_ID',params,'YOUR_PUBLIC_KEY').catch(function(){}); }
  else { console.log('📧 Email (demo):', params); }
}
function toast(msg, type) {
  type = type || 'ok';
  var c = document.getElementById('toasts'); if (!c) return;
  var t = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerHTML = (type==='ok'?'✅':type==='err'?'❌':type==='info'?'ℹ️':'💬') + ' ' + msg;
  c.appendChild(t);
  setTimeout(function() { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(function(){ t.remove(); },300); }, 3500);
}

document.addEventListener('click', function(ev) { if (ev.target && ev.target.id === 'item-modal') closeModal(); });

// ════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════
renderFeatured();
renderGallery();
renderCatalog();   // FIX: was missing — caused blank catalog page
renderAdmin();
var dateEl = document.getElementById('b-date');
if (dateEl) dateEl.min = new Date().toISOString().split('T')[0];
