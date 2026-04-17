<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SentinelOS</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#07060b;--bg-p:#0d0c14;--bg-c:#13121c;--bg-ch:#1a1926;
  --b:#1f1e2e;--bb:#2d2b42;
  --p4:#a78bfa;--p5:#8b5cf6;--p6:#7c3aed;--p7:#6d28d9;
  --t1:#eeedf5;--t2:#8b89a0;--t3:#5c5a6e;
  --red:#ef4444;--ora:#f97316;--yel:#eab308;--grn:#22c55e;--blu:#3b82f6;
  --rd:rgba(239,68,68,.12);--od:rgba(249,115,22,.12);--yd:rgba(234,179,8,.12);
  --gd:rgba(34,197,94,.12);--bd:rgba(59,130,246,.12);--pd:rgba(124,58,237,.12);
  --tl:42px;
}
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;width:100%;overflow:hidden}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--t1);position:relative}
body::before{content:'';position:fixed;inset:0;background:
  repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(167,139,250,.016) 39px,rgba(167,139,250,.016) 40px),
  repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(167,139,250,.01) 39px,rgba(167,139,250,.01) 40px);
  pointer-events:none;z-index:0}

/* ── TOPBAR ── */
.topbar{height:52px;background:rgba(13,12,20,.98);border-bottom:1px solid var(--b);display:flex;align-items:center;justify-content:space-between;padding:0 18px;z-index:1000;position:relative;backdrop-filter:blur(20px)}
.topbar-l{display:flex;align-items:center;gap:12px}
.logo{width:30px;height:30px;background:linear-gradient(135deg,var(--p7),var(--p4));border-radius:8px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(124,58,237,.4);flex-shrink:0}
.logo svg{width:17px;height:17px}
.logo-name{font-weight:700;font-size:15px;letter-spacing:-.03em}
.logo-ver{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--t3);margin-left:4px;background:var(--pd);padding:1px 5px;border-radius:3px;border:1px solid rgba(124,58,237,.2)}
.tabs{display:flex;gap:2px;background:rgba(7,6,11,.6);padding:3px;border-radius:9px;border:1px solid var(--b)}
.tab{padding:5px 15px;border-radius:7px;border:none;background:transparent;color:var(--t2);font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:7px}
.tab:hover{color:var(--t1);background:var(--bg-ch)}
.tab.on{background:var(--p6);color:#fff;box-shadow:0 2px 14px rgba(124,58,237,.35)}
.tdot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.tdot.flood{background:var(--blu)}.tdot.quake{background:var(--ora)}.tdot.fire{background:var(--red)}.tdot.stream{background:var(--grn)}
.tsep{width:1px;height:22px;background:var(--bb);margin:0 3px;opacity:.5}
.topbar-r{display:flex;align-items:center;gap:14px}
.live{display:flex;align-items:center;gap:6px;font-size:10px;font-weight:700;color:var(--red);letter-spacing:.08em;background:var(--rd);padding:4px 10px;border-radius:5px;border:1px solid rgba(239,68,68,.2)}
.ldot{width:5px;height:5px;background:var(--red);border-radius:50%;animation:blink 1.4s infinite;box-shadow:0 0 5px var(--red)}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
.clock{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--t2);letter-spacing:.04em}
.sys-h{display:flex;align-items:center;gap:10px;padding:0 12px;border-left:1px solid var(--b)}
.hi{text-align:center}
.hl{font-size:8px;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:1px}
.hv{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;color:var(--grn)}
.hv.w{color:var(--yel)}
.hsep{width:1px;height:22px;background:var(--b)}

/* ── LAYOUT ── */
.layout{display:grid;grid-template-columns:278px 1fr 300px;height:calc(100vh - 52px - var(--tl));position:relative;z-index:1}
.pnl{background:rgba(13,12,20,.95);overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:14px}
.pnl::-webkit-scrollbar{width:3px}.pnl::-webkit-scrollbar-thumb{background:var(--bb);border-radius:3px}
.pl{border-right:1px solid var(--b)}.pr{border-left:1px solid var(--b)}

/* ── SECTION TITLES ── */
.stit{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:var(--t3);margin-bottom:10px;display:flex;align-items:center;gap:8px}
.stit::before{content:'';display:block;width:3px;height:10px;border-radius:2px;background:var(--p6);flex-shrink:0}

/* ── STATS ── */
.stat-row{display:flex;gap:6px}
.sb{flex:1;background:var(--bg-c);border:1px solid var(--b);border-radius:9px;padding:11px 8px;text-align:center;transition:border-color .2s}
.sb:hover{border-color:var(--bb)}
.sn{font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;line-height:1;transition:color .4s}
.sl{font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.07em;margin-top:3px}

/* ── FLEET ── */
.fleet{display:flex;flex-direction:column;gap:5px}
.fi{display:flex;flex-direction:column;background:var(--bg-c);border:1px solid var(--b);border-radius:8px;padding:8px 11px;transition:all .2s;cursor:default}
.fi:hover{border-color:var(--p6);background:var(--bg-ch)}
.fi-top{display:flex;align-items:center;gap:9px}
.fdot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.fdot.active{background:var(--grn);box-shadow:0 0 5px var(--grn)}.fdot.transit{background:var(--blu)}.fdot.delivery{background:var(--ora)}.fdot.standby{background:var(--t3)}
.fid{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;color:var(--p4);flex:1}
.fst{font-size:10px;color:var(--t2);flex:1}
.fbatt-wrap{display:flex;align-items:center;gap:4px}
.fb{width:26px;height:3px;background:rgba(255,255,255,.05);border-radius:2px;overflow:hidden}
.ff{height:100%;border-radius:2px;transition:width .6s}
.ff.hi{background:var(--grn)}.ff.md{background:var(--yel)}.ff.lo{background:var(--red)}
.fv-n{font-family:'JetBrains Mono',monospace;font-size:9px}
.fi-sub{display:flex;gap:0;font-family:'JetBrains Mono',monospace;font-size:8.5px;color:var(--t3);margin-top:4px;margin-left:16px;gap:8px;letter-spacing:.01em}
.fi-sub b{color:var(--t2)}

/* ── ALERTS ── */
.al-list{display:flex;flex-direction:column;gap:5px}
.al{background:var(--bg-c);border:1px solid var(--b);border-radius:8px;padding:10px 11px;cursor:pointer;transition:all .2s;border-left:3px solid transparent}
.al:hover{background:var(--bg-ch);transform:translateX(1px)}
.al.sc{border-left-color:var(--red)}.al.sh{border-left-color:var(--ora)}
.al-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.al-name{font-size:11px;font-weight:600}
.al-conf{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;padding:2px 6px;border-radius:4px}
.al-conf.hi{background:var(--gd);color:var(--grn)}.al-conf.md{background:var(--yd);color:var(--yel)}
.al-desc{font-size:10px;color:var(--t2);line-height:1.45;margin-bottom:4px}
.al-foot{display:flex;gap:10px;font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--t3)}

/* ── MAP ── */
.mapwrap{position:relative;overflow:hidden}
#map{width:100%;height:100%}
.leaflet-container{background:#07060b !important}
.leaflet-control-zoom{border:1px solid rgba(31,30,46,.9)!important;border-radius:9px!important;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.6)!important}
.leaflet-control-zoom a{background:rgba(13,12,20,.95)!important;color:var(--t1)!important;border-color:var(--b)!important;width:30px!important;height:30px!important;line-height:30px!important;font-size:15px!important}
.leaflet-control-zoom a:hover{background:var(--bg-ch)!important;color:var(--p4)!important}
.leaflet-popup-content-wrapper{background:rgba(11,10,18,.97)!important;color:var(--t1)!important;border:1px solid var(--bb)!important;border-radius:10px!important;box-shadow:0 8px 30px rgba(0,0,0,.7)!important}
.leaflet-popup-tip{background:rgba(11,10,18,.97)!important}
.leaflet-popup-content{margin:10px 14px!important;font-family:'DM Sans',sans-serif!important;font-size:11.5px!important;line-height:1.6!important}
.leaflet-control-attribution{display:none!important}

/* ── HUD ── */
.hud{position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:800;background:rgba(7,6,11,.92);backdrop-filter:blur(20px);border:1px solid var(--bb);border-radius:11px;padding:9px 20px;display:flex;align-items:center;gap:20px;box-shadow:0 4px 24px rgba(0,0,0,.5)}
.hi-item{text-align:center}
.hi-val{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;transition:color .4s}
.hi-lbl{font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.05em;margin-top:1px}
.hsep2{width:1px;height:26px;background:var(--b)}
.legend{position:absolute;bottom:16px;left:14px;z-index:800;background:rgba(7,6,11,.92);backdrop-filter:blur(20px);border:1px solid var(--bb);border-radius:9px;padding:10px 13px}
.leg-t{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--t3);margin-bottom:7px}
.leg-r{display:flex;align-items:center;gap:8px;font-size:10px;color:var(--t2);margin-bottom:4px}
.leg-r:last-child{margin-bottom:0}
.leg-s{width:10px;height:10px;border-radius:3px;opacity:.85}

/* ── PING ── */
@keyframes ping{0%{transform:scale(1);opacity:.8}80%{transform:scale(2.4);opacity:0}100%{opacity:0}}

/* ── WEATHER ── */
.wx-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.wx-c{background:var(--bg-c);border:1px solid var(--b);border-radius:8px;padding:10px}
.wx-l{font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px}
.wx-v{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;transition:color .4s}
.wx-u{font-size:10px;font-weight:400;color:var(--t3)}
.wx-d{font-family:'JetBrains Mono',monospace;font-size:9px;margin-top:2px}
.wx-d.up{color:var(--red)}.wx-d.dn{color:var(--blu)}.wx-d.fl{color:var(--t3)}

/* ── RISK ENGINE ── */
.re{background:var(--bg-c);border:1px solid var(--b);border-radius:8px;padding:12px}
.re-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.re-score-wrap{display:flex;align-items:baseline;gap:4px}
.re-score{font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:700;line-height:1;transition:color .5s}
.re-max{font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--t3)}
.re-lv{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;padding:3px 8px;border-radius:5px;transition:all .5s}
.re-bar-bg{height:5px;background:rgba(255,255,255,.05);border-radius:3px;overflow:hidden;margin-bottom:9px}
.re-bar{height:100%;border-radius:3px;transition:width 1s ease,background .5s}
.re-feats{display:flex;flex-direction:column;gap:4px}
.re-feat{display:flex;align-items:center;justify-content:space-between;padding:4px 7px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04);border-radius:5px}
.re-fn{font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.05em}
.re-fv{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;transition:color .4s}

/* ── COMPARE ── */
.cmp{background:var(--bg-c);border:1px solid var(--b);border-radius:8px;padding:10px 12px}
.cmp-head{display:flex;justify-content:space-between;padding-bottom:6px;margin-bottom:4px;border-bottom:1px solid var(--b)}
.cmp-head span{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.cs{color:var(--p4)}.ca{color:var(--t3)}
.cmp-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(31,30,46,.4)}
.cmp-row:last-child{border-bottom:none}
.cmp-m{font-size:10px;color:var(--t2);flex:1}
.cmp-vs{display:flex;gap:14px}
.cv{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;min-width:58px;text-align:right}
.cv.s{color:var(--p4)}.cv.a{color:var(--t3)}

/* ── TICKETS ── */
.tklist{display:flex;flex-direction:column;gap:10px}
.tk{background:var(--bg-c);border:1px solid var(--b);border-radius:10px;overflow:hidden;transition:all .22s;position:relative}
.tk::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
.tk.tc::before{background:linear-gradient(90deg,var(--red),rgba(239,68,68,.2))}
.tk.th::before{background:linear-gradient(90deg,var(--ora),rgba(249,115,22,.2))}
.tk:hover{border-color:var(--bb);background:var(--bg-ch);transform:translateY(-1px);box-shadow:0 6px 24px rgba(0,0,0,.4)}
.tk-in{padding:12px 13px 13px}
.tk-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px}
.tk-id-w{display:flex;align-items:center;gap:8px}
.tk-id{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;color:var(--p4)}
.tk-pr{font-size:8px;font-weight:700;padding:2px 8px;border-radius:5px;text-transform:uppercase;letter-spacing:.06em}
.tk-pr.critical{background:var(--rd);color:var(--red);border:1px solid rgba(239,68,68,.25)}
.tk-pr.high{background:var(--od);color:var(--ora);border:1px solid rgba(249,115,22,.25)}
.tk-title{font-size:12px;font-weight:700;margin-bottom:6px;line-height:1.35}
.tk-desc{font-size:10px;color:var(--t2);line-height:1.5;margin-bottom:10px}
.tk-gps{display:flex;align-items:center;gap:7px;background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.14);border-radius:6px;padding:6px 9px;margin-bottom:8px}
.gps-ico{width:14px;height:14px;flex-shrink:0;opacity:.7}
.gps-lbl{font-size:8px;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:1px}
.gps-co{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;color:var(--blu)}
.tk-meta{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px}
.tm-it{background:rgba(255,255,255,.03);border:1px solid var(--b);border-radius:6px;padding:6px 8px}
.tm-l{font-size:8px;color:var(--t3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:2px}
.tm-v{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600}
.tk-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px}
.tag{font-size:9px;font-weight:600;padding:3px 8px;border-radius:5px;background:var(--pd);color:var(--p4);border:1px solid rgba(124,58,237,.18)}
.tk-acts{display:flex;gap:6px}
.btn{padding:6px 13px;border-radius:7px;border:none;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:700;cursor:pointer;transition:all .18s}
.btn-p{background:var(--p6);color:#fff;box-shadow:0 2px 12px rgba(124,58,237,.3)}.btn-p:hover{background:var(--p5);transform:translateY(-1px)}
.btn-g{background:transparent;color:var(--t2);border:1px solid var(--b)}.btn-g:hover{border-color:var(--bb);color:var(--t1)}

/* ── TILE BANNER ── */
.tile-bn{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:900;background:rgba(7,6,11,.96);backdrop-filter:blur(20px);border:1px solid var(--bb);border-radius:12px;padding:22px 30px;text-align:center;transition:opacity .5s;pointer-events:none}
.tile-bn.hidden{opacity:0}
.tile-bn-t{font-size:13px;font-weight:600;margin-bottom:6px}
.tile-bn-s{font-size:11px;color:var(--t2);line-height:1.55}

/* ── SPLASH ── */
.splash{position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:2000;background:rgba(7,6,11,.97);backdrop-filter:blur(24px);border:1px solid var(--bb);border-radius:12px;padding:14px 24px;display:flex;align-items:center;gap:14px;box-shadow:0 8px 40px rgba(0,0,0,.7);opacity:0;pointer-events:none;transition:opacity .25s;min-width:320px}
.splash.show{opacity:1}
.sp-ico{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.sp-title{font-size:13px;font-weight:700;margin-bottom:2px}
.sp-sub{font-size:10px;color:var(--t2)}

/* ── TIMELINE ── */
.tl{position:fixed;bottom:0;left:0;right:0;height:var(--tl);background:rgba(7,6,11,.99);border-top:1px solid var(--b);z-index:999;display:flex;align-items:center;overflow:hidden}
.tl-lbl{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--t3);padding:0 14px;white-space:nowrap;border-right:1px solid var(--b);min-width:76px;text-align:center}
.tl-track{flex:1;overflow:hidden;position:relative;height:100%}
.tl-inner{display:flex;align-items:center;position:absolute;white-space:nowrap;animation:tlScroll 55s linear infinite}
@keyframes tlScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.tl-ev{display:inline-flex;align-items:center;gap:8px;padding:0 18px;height:var(--tl);border-right:1px solid var(--b)}
.tl-t{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--t3)}
.tl-d{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.tl-tx{font-size:10px;color:var(--t2)}
.tl-bx{font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;padding:1px 6px;border-radius:3px;text-transform:uppercase;letter-spacing:.04em}

/* ── SENSOR VIEW ── */
.sv{display:none;height:calc(100vh - 52px - var(--tl));position:relative;z-index:1;flex-direction:column;background:rgba(13,12,20,.96)}
.sv.on{display:flex}
.sv-hdr{display:flex;align-items:center;justify-content:space-between;padding:9px 16px;border-bottom:1px solid var(--b);background:rgba(7,6,11,.7);flex-shrink:0}
.sv-hl{display:flex;align-items:center;gap:14px}
.sv-tit{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:var(--t3)}
.sv-cnt{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;color:var(--grn);background:var(--gd);padding:2px 9px;border-radius:4px;border:1px solid rgba(34,197,94,.2)}
.sv-sc{font-size:10px;color:var(--t2)}
.sv-sync{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--t3);display:flex;align-items:center;gap:6px}
.sv-sdot{width:5px;height:5px;border-radius:50%;background:var(--grn);animation:blink 2s infinite}
.sv-body{display:grid;grid-template-columns:264px 1fr 284px;flex:1;overflow:hidden}

/* ── RAW FEED ── */
.rf{border-right:1px solid var(--b);display:flex;flex-direction:column;overflow:hidden;background:rgba(4,4,7,.9)}
.rf-hdr{padding:7px 12px;border-bottom:1px solid var(--b);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;background:rgba(7,6,11,.5)}
.rf-t{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--t3)}
.rf-hz{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--grn);animation:blink 2.5s infinite}
.rf-body{flex:1;overflow-y:auto;padding:5px 0;font-family:'JetBrains Mono',monospace;font-size:8.8px;line-height:1.9}
.rf-body::-webkit-scrollbar{display:none}
.fl{padding:0 10px;border-left:2px solid transparent;animation:fs .18s ease}
@keyframes fs{from{opacity:0;background:rgba(167,139,250,.05)}to{opacity:1;background:transparent}}
.fl:hover{background:rgba(255,255,255,.02)}
.fl.an{border-left-color:var(--red);background:rgba(239,68,68,.03)!important}
.fl.wn{border-left-color:var(--ora)}
/* feed token colors */
.ft{color:#2e2c42}.fid{color:var(--p4);font-weight:600}.ftp{color:#3a3852;font-size:8px;text-transform:uppercase;letter-spacing:.06em}
.fk{color:#3a3852}.fv{color:#b8b5d0}
.fv.hot{color:var(--red)}.fv.warn{color:var(--ora)}.fv.ok{color:var(--grn)}.fv.hi{color:var(--p4)}

/* ── DRONE CARDS ── */
.dc-area{padding:12px;overflow-y:auto;display:grid;grid-template-columns:1fr 1fr;gap:10px;align-content:start}
.dc-area::-webkit-scrollbar{width:3px}.dc-area::-webkit-scrollbar-thumb{background:var(--bb);border-radius:3px}
.dc{background:var(--bg-c);border:1px solid var(--b);border-radius:10px;overflow:hidden;transition:all .2s}
.dc:hover{border-color:var(--p6);transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.4)}
.dc-h{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--b);background:rgba(255,255,255,.015)}
.dc-id{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;color:var(--p4)}
.dc-sg{display:flex;align-items:center;gap:6px}
.dc-sd{width:6px;height:6px;border-radius:50%}
.dc-sd.active{background:var(--grn);box-shadow:0 0 5px var(--grn)}.dc-sd.transit{background:var(--blu)}.dc-sd.delivery{background:var(--ora)}
.dc-st{font-size:9px;color:var(--t3)}
.dc-body{padding:8px 10px}
.dc-r{display:flex;align-items:center;justify-content:space-between;padding:2.5px 0;border-bottom:1px solid rgba(31,30,46,.3)}
.dc-r:last-child{border-bottom:none}
.dc-k{font-size:8.5px;color:var(--t3);text-transform:uppercase;letter-spacing:.04em;width:62px;flex-shrink:0}
.dc-v{font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:600;flex:1;text-align:right;transition:color .3s}
.dc-v.hot{color:var(--red)}.dc-v.warn{color:var(--ora)}.dc-v.ok{color:var(--grn)}.dc-v.hi{color:var(--p4)}.dc-v.dim{color:var(--t2)}
.dc-dd{font-family:'JetBrains Mono',monospace;font-size:7.5px;width:14px;text-align:right}
.dc-dd.up{color:var(--red)}.dc-dd.dn{color:var(--blu)}.dc-dd.fl{color:var(--t3)}
.dc-ft{padding:7px 10px;border-top:1px solid var(--b);display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,.15)}
.dc-meta{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:var(--t3);display:flex;align-items:center;gap:6px}
.dc-meta b{color:var(--t2)}
.sig{display:flex;align-items:flex-end;gap:1.5px;height:9px}
.sb2{width:3px;border-radius:1px;background:rgba(255,255,255,.08)}
.sb2.on{background:var(--grn)}.sb2.wn{background:var(--yel)}
.dc-spark{padding:0 10px 8px;background:rgba(0,0,0,.25)}
.dc-svg{display:block;width:100%;height:22px}

/* ── GPS COORDS IN CARD ── */
.dc-gps{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--t3);padding:4px 10px;border-top:1px solid var(--b);letter-spacing:.02em}
.dc-gps b{color:var(--t2)}

/* ── PIPELINE ── */
.pipe{border-left:1px solid var(--b);padding:14px;overflow-y:auto;display:flex;flex-direction:column;gap:10px}
.pipe::-webkit-scrollbar{width:3px}.pipe::-webkit-scrollbar-thumb{background:var(--bb);border-radius:3px}
.pp-t{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:var(--t3);display:flex;align-items:center;gap:8px;margin-bottom:2px}
.pp-t::before{content:'';display:block;width:3px;height:10px;border-radius:2px;background:var(--grn);flex-shrink:0}
.ps{background:var(--bg-c);border:1px solid var(--b);border-radius:8px;padding:10px 11px}
.ps-l{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t3);margin-bottom:7px;display:flex;align-items:center;gap:6px}
.ps-n{width:15px;height:15px;border-radius:4px;background:var(--pd);border:1px solid rgba(124,58,237,.2);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:var(--p4);flex-shrink:0}
.ps-kv{display:flex;align-items:center;justify-content:space-between;padding:2.5px 0}
.ps-k{font-size:9px;color:var(--t3)}
.ps-v{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;transition:color .4s}
.pa{display:flex;flex-direction:column;align-items:center;gap:2px;padding:1px 0}
.pa-l{width:1px;height:14px;background:linear-gradient(to bottom,transparent,var(--p6),transparent);position:relative;overflow:hidden}
.pa-d{width:4px;height:4px;background:var(--p4);border-radius:50%;position:absolute;left:-1.5px;top:-4px;animation:fd 1.4s linear infinite}
@keyframes fd{0%{top:-4px;opacity:0}15%{opacity:1}85%{opacity:1}100%{top:calc(100% + 4px);opacity:0}}
.pa-h{font-size:8px;color:var(--p6);line-height:1}
.psc{background:var(--bg-c);border:1px solid var(--b);border-radius:8px;padding:14px 12px;text-align:center}
.psc-l{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--t3);margin-bottom:10px}
.psc-n{font-family:'JetBrains Mono',monospace;font-size:52px;font-weight:700;line-height:1;transition:color .6s;margin-bottom:8px}
.psc-bb{height:7px;background:rgba(255,255,255,.05);border-radius:4px;overflow:hidden;margin-bottom:6px}
.psc-bf{height:100%;border-radius:4px;transition:width 1.2s ease,background .6s}
.psc-lv{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;transition:color .6s}
.psc-sub{font-size:9px;color:var(--t3);margin-top:4px}
.pm{background:rgba(124,58,237,.05);border:1px solid rgba(124,58,237,.15);border-radius:6px;padding:9px 10px}
.pm-r{display:flex;justify-content:space-between;align-items:center;padding:2px 0;font-size:9px}
.pm-k{color:var(--t3)}.pm-v{font-family:'JetBrains Mono',monospace;font-weight:600;color:var(--p4)}

/* ── NUM FLASH ── */
@keyframes numFlash{0%,100%{background:transparent}15%{background:rgba(167,139,250,.14)}}
.nf{animation:numFlash .7s ease}
</style>
</head>
<body>

<!-- SPLASH -->
<div class="splash" id="splash">
  <div class="sp-ico" id="sp-ico"></div>
  <div><div class="sp-title" id="sp-t">Loading...</div><div class="sp-sub" id="sp-s"></div></div>
</div>

<!-- TOPBAR -->
<div class="topbar">
  <div class="topbar-l">
    <div class="logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="12" x2="5.5" y2="5.5"/><line x1="12" y1="12" x2="18.5" y2="5.5"/>
        <line x1="12" y1="12" x2="5.5" y2="18.5"/><line x1="12" y1="12" x2="18.5" y2="18.5"/>
        <circle cx="5.5" cy="5.5" r="2.2"/><circle cx="18.5" cy="5.5" r="2.2"/>
        <circle cx="5.5" cy="18.5" r="2.2"/><circle cx="18.5" cy="18.5" r="2.2"/>
        <circle cx="12" cy="12" r="1.8" fill="white" opacity=".55"/>
      </svg>
    </div>
    <span class="logo-name">SentinelOS<span class="logo-ver">v2.4.1</span></span>
  </div>
  <div class="tabs">
    <button class="tab on" data-s="flood"><span class="tdot flood"></span>Hill Country Flood</button>
    <button class="tab" data-s="quake"><span class="tdot quake"></span>Culberson County</button>
    <button class="tab" data-s="fire"><span class="tdot fire"></span>Eastland Complex</button>
    <div class="tsep"></div>
    <button class="tab" data-s="stream"><span class="tdot stream"></span>Sensor Stream</button>
  </div>
  <div class="topbar-r">
    <div class="sys-h">
      <div class="hi"><div class="hl">Inference</div><div class="hv" id="h-inf">143ms</div></div>
      <div class="hsep"></div>
      <div class="hi"><div class="hl">GPS Lock</div><div class="hv" id="h-gps">4/4</div></div>
      <div class="hsep"></div>
      <div class="hi"><div class="hl">Uptime</div><div class="hv" id="h-up">06:14:32</div></div>
      <div class="hsep"></div>
      <div class="hi"><div class="hl">Pkt/s</div><div class="hv" id="h-pkt">12.4</div></div>
    </div>
    <div class="live"><span class="ldot"></span>LIVE</div>
    <div class="clock" id="clock"></div>
  </div>
</div>

<!-- MAIN LAYOUT -->
<div class="layout" id="layout">
  <div class="pnl pl">
    <div><div class="stit">Overview</div><div class="stat-row" id="stats"></div></div>
    <div><div class="stit">Drone Fleet</div><div class="fleet" id="fleet"></div></div>
    <div><div class="stit">Detections</div><div class="al-list" id="alerts"></div></div>
  </div>
  <div class="mapwrap">
    <div id="map"></div>
    <div class="hud" id="hud"></div>
    <div class="legend">
      <div class="leg-t">Risk Level</div>
      <div class="leg-r"><div class="leg-s" style="background:var(--red)"></div>Critical</div>
      <div class="leg-r"><div class="leg-s" style="background:var(--ora)"></div>High</div>
      <div class="leg-r"><div class="leg-s" style="background:var(--yel)"></div>Moderate</div>
      <div class="leg-r"><div class="leg-s" style="background:var(--grn)"></div>Low</div>
    </div>
    <div class="tile-bn" id="tile-bn">
      <div class="tile-bn-t">Loading satellite imagery...</div>
      <div class="tile-bn-s">If tiles don't load, download and open locally in Chrome.</div>
    </div>
  </div>
  <div class="pnl pr">
    <div><div class="stit" id="wx-t">Hyperlocal Weather</div><div class="wx-grid" id="wx"></div></div>
    <div>
      <div class="stit">AI Risk Engine</div>
      <div class="re">
        <div class="re-top">
          <div class="re-score-wrap"><span class="re-score" id="re-sc">87</span><span class="re-max">/100</span></div>
          <span class="re-lv" id="re-lv">HIGH</span>
        </div>
        <div class="re-bar-bg"><div class="re-bar" id="re-bar"></div></div>
        <div class="re-feats" id="re-feats"></div>
      </div>
    </div>
    <div><div class="stit">Sentinel vs Public API</div><div class="cmp" id="cmp"></div></div>
    <div><div class="stit">Mission Tickets</div><div class="tklist" id="tickets"></div></div>
  </div>
</div>

<!-- SENSOR STREAM -->
<div class="sv" id="sv">
  <div class="sv-hdr">
    <div class="sv-hl">
      <span class="sv-tit">Live Telemetry</span>
      <span class="sv-cnt" id="sv-cnt">5 Drones Reporting</span>
      <span class="sv-sc" id="sv-sc">Hill Country Flood Response</span>
    </div>
    <div class="sv-sync"><span class="sv-sdot"></span><span id="sv-ts">Syncing...</span></div>
  </div>
  <div class="sv-body">
    <div class="rf">
      <div class="rf-hdr">
        <span class="rf-t">BME688 Raw Output</span>
        <span class="rf-hz" id="rf-hz">2.4 Hz</span>
      </div>
      <div class="rf-body" id="rf-body"></div>
    </div>
    <div class="dc-area" id="dc-area"></div>
    <div class="pipe">
      <div class="pp-t">AI Risk Engine v2.1</div>
      <div class="ps">
        <div class="ps-l"><div class="ps-n">1</div>Input Layer — BME688</div>
        <div class="ps-kv"><span class="ps-k">Temp (°C / °F)</span><span class="ps-v" id="pp-t">29.01°C / 84.2°F</span></div>
        <div class="ps-kv"><span class="ps-k">Humidity</span><span class="ps-v" id="pp-h">97.14%</span></div>
        <div class="ps-kv"><span class="ps-k">Pressure</span><span class="ps-v" id="pp-p">996.41 hPa</span></div>
        <div class="ps-kv"><span class="ps-k">Gas Resistance</span><span class="ps-v" id="pp-g">48.3 kΩ</span></div>
        <div class="ps-kv"><span class="ps-k">IAQ Index</span><span class="ps-v" id="pp-iaq">35</span></div>
        <div class="ps-kv"><span class="ps-k">Altitude AGL</span><span class="ps-v" id="pp-a">62 m</span></div>
      </div>
      <div class="pa"><div class="pa-l"><div class="pa-d"></div></div><div class="pa-h">▼</div></div>
      <div class="ps">
        <div class="ps-l"><div class="ps-n">2</div>Feature Extraction</div>
        <div class="ps-kv"><span class="ps-k">ΔP/hr velocity</span><span class="ps-v" id="pp-dp">−0.18 inHg</span></div>
        <div class="ps-kv"><span class="ps-k">ΔH/hr delta</span><span class="ps-v" id="pp-dh">+4.3%</span></div>
        <div class="ps-kv"><span class="ps-k">Gas resist. vel.</span><span class="ps-v" id="pp-dgr">−2.1 kΩ/hr</span></div>
        <div class="ps-kv"><span class="ps-k">Thermal spread</span><span class="ps-v" id="pp-th">0.62°</span></div>
        <div class="ps-kv"><span class="ps-k">Wind shear est.</span><span class="ps-v" id="pp-ws">Moderate</span></div>
      </div>
      <div class="pa"><div class="pa-l"><div class="pa-d" style="animation-delay:.5s"></div></div><div class="pa-h">▼</div></div>
      <div class="pm">
        <div class="pm-r"><span class="pm-k">Model</span><span class="pm-v">Random Forest + NOAA</span></div>
        <div class="pm-r"><span class="pm-k">Active features</span><span class="pm-v">18</span></div>
        <div class="pm-r"><span class="pm-k">Last inference</span><span class="pm-v" id="pp-inf">143ms</span></div>
        <div class="pm-r"><span class="pm-k">NOAA overlay</span><span class="pm-v">Active</span></div>
      </div>
      <div class="pa"><div class="pa-l"><div class="pa-d" style="animation-delay:1s"></div></div><div class="pa-h">▼</div></div>
      <div class="psc">
        <div class="psc-l">Risk Score Output</div>
        <div class="psc-n" id="pp-sc">87</div>
        <div class="psc-bb"><div class="psc-bf" id="pp-bf"></div></div>
        <div class="psc-lv" id="pp-lv">HIGH RISK</div>
        <div class="psc-sub" id="pp-sub">Flood imminent · 3 critical detections</div>
      </div>
    </div>
  </div>
</div>

<!-- TIMELINE -->
<div class="tl">
  <div class="tl-lbl">Event Log</div>
  <div class="tl-track"><div class="tl-inner" id="tl-inner"></div></div>
</div>

<script>
// ── UPTIME + CLOCK ──
var upSec=22472;
function tickClock(){
  document.getElementById('clock').textContent=new Date().toLocaleTimeString('en-US',{hour12:false})+' CST';
  upSec++;
  var H=Math.floor(upSec/3600),M=Math.floor((upSec%3600)/60),S=upSec%60;
  document.getElementById('h-up').textContent=[H,M,S].map(function(v){return String(v).padStart(2,'0')}).join(':');
}
setInterval(tickClock,1000); tickClock();

// ── MAP ──
var map=L.map('map',{zoomControl:true,attributionControl:false}).setView([30.01,-99.80],14);
var loaded=false;
var bn=document.getElementById('tile-bn');
function onLoad(){if(!loaded){loaded=true;bn.classList.add('hidden');setTimeout(function(){bn.style.display='none'},600)}}
var esri=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19}).addTo(map);
esri.on('tileload',onLoad);
L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,opacity:0.5}).addTo(map);
L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,opacity:0.65}).addTo(map);
setTimeout(function(){
  if(!loaded){
    var g=L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{maxZoom:20,subdomains:'0123'}).addTo(map);
    g.on('tileload',onLoad);
    L.tileLayer('https://mt{s}.google.com/vt/lyrs=h&x={x}&y={y}&z={z}',{maxZoom:20,subdomains:'0123',opacity:0.5}).addTo(map);
  }
},5000);
setTimeout(function(){if(!loaded) L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map)},10000);

var layers=[];
function clearLayers(){layers.forEach(function(l){map.removeLayer(l)});layers=[]}
function addZone(c,col,op){var p=L.polygon(c,{color:col,weight:1.8,fillColor:col,fillOpacity:op||.38,opacity:.75}).addTo(map);layers.push(p)}
function addCritDot(lat,lng,col,pop){
  var h='<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center">'
    +'<div style="position:absolute;inset:0;border-radius:50%;background:'+col+';opacity:.25;animation:ping 2s ease-out infinite"></div>'
    +'<div style="position:absolute;inset:0;border-radius:50%;background:'+col+';opacity:.12;animation:ping 2s ease-out infinite .55s"></div>'
    +'<div style="position:relative;width:14px;height:14px;border-radius:50%;background:'+col+';border:2px solid rgba(255,255,255,.5);box-shadow:0 0 12px '+col+'"></div></div>';
  var m=L.marker([lat,lng],{icon:L.divIcon({html:h,className:'',iconSize:[32,32],iconAnchor:[16,16]})}).addTo(map);
  if(pop) m.bindPopup('<div style="font-size:11px;line-height:1.65">'+pop+'</div>');
  layers.push(m);
}
function addDot(lat,lng,col,r,pop){
  var c=L.circleMarker([lat,lng],{radius:r,color:col,fillColor:col,fillOpacity:.75,weight:2,opacity:.9}).addTo(map);
  if(pop) c.bindPopup('<div style="font-size:11px;line-height:1.65">'+pop+'</div>');
  layers.push(c);
}
var curScene='flood';
function dronePopup(d){
  var volt=voltFromBatt(d.batt);
  var gas=d.gas_r>1000?(d.gas_r/1000).toFixed(1)+' kΩ':d.gas_r+' Ω';
  var tc=(((d.t-32)*5)/9).toFixed(2);
  var hpa=(d.p*33.8639).toFixed(2);
  return '<strong style="color:#a78bfa;font-size:12px">'+d.id+'</strong>'
    +'<div style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:8.5px;letter-spacing:.08em;margin:3px 0 6px">BME688 TELEMETRY FRAME</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 12px;font-family:JetBrains Mono,monospace;font-size:10px">'
    +'<span style="color:#5c5a6e">Temp</span><span>'+tc+'°C / '+d.t.toFixed(1)+'°F</span>'
    +'<span style="color:#5c5a6e">Humidity</span><span>'+d.h.toFixed(2)+'%</span>'
    +'<span style="color:#5c5a6e">Pressure</span><span>'+hpa+' hPa</span>'
    +'<span style="color:#5c5a6e">Gas Resist.</span><span>'+gas+'</span>'
    +'<span style="color:#5c5a6e">IAQ Index</span><span style="color:'+(d.iaq>200?'#ef4444':d.iaq>100?'#f97316':'#22c55e')+'">'+d.iaq+'</span>'
    +'<span style="color:#5c5a6e">Altitude</span><span>'+d.alt.toFixed(1)+' m AGL</span>'
    +'<span style="color:#5c5a6e">Ground Spd</span><span>'+d.spd.toFixed(1)+' m/s</span>'
    +'<span style="color:#5c5a6e">Heading</span><span>'+d.hdg+'°</span>'
    +'<span style="color:#5c5a6e">Battery</span><span>'+volt+'V ('+Math.round(d.batt)+'%)</span>'
    +'<span style="color:#5c5a6e">RSSI</span><span>'+d.rssi+' dBm</span>'
    +'<span style="color:#5c5a6e">GPS</span><span>'+d.lat.toFixed(4)+'°N '+Math.abs(d.lng).toFixed(4)+'°W</span>'
    +'<span style="color:#5c5a6e">GPS FIX</span><span style="color:#22c55e">3D-DGPS</span>'
    +'</div>'
    +'<div style="margin-top:7px;font-family:JetBrains Mono,monospace;font-size:8px;color:#3d3b52">SEQ:'+d.seq+'  CPU:'+d.cpu+'%  MCU:'+d.mcu_t+'°C</div>';
}
function addDrone(d){
  var h='<div style="position:relative;width:22px;height:22px">'
    +'<div style="width:22px;height:22px;border-radius:50%;background:rgba(124,58,237,.22);border:2px solid #7c3aed;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(124,58,237,.5)">'
    +'<div style="width:6px;height:6px;background:#a78bfa;border-radius:50%"></div></div></div>';
  var m=L.marker([d.lat,d.lng],{icon:L.divIcon({html:h,className:'',iconSize:[22,22],iconAnchor:[11,11]})}).addTo(map);
  m.bindPopup('<div style="font-size:11px;line-height:1.6">'+dronePopup(d)+'</div>');
  layers.push(m);
}
function addPath(from,to,col){var p=L.polyline([from,to],{color:col||'#7c3aed',weight:1.5,opacity:.5,dashArray:'6,5'}).addTo(map);layers.push(p)}
function addCoverage(lat,lng){var c=L.circle([lat,lng],{radius:175,color:'#7c3aed',fillColor:'#7c3aed',fillOpacity:.035,weight:1,opacity:.18,dashArray:'4,6'}).addTo(map);layers.push(c)}

// ── SENSOR HELPERS ──
function voltFromBatt(b){return (13.6+(b/100)*3.2).toFixed(1)}
function gasFromVoc(v){
  if(v<50) return Math.round(50000-v*580);
  if(v<200) return Math.round(20000-(v-50)*98);
  if(v<500) return Math.round(5100-(v-200)*9.8);
  return Math.max(480,Math.round(2160-(v-500)*1.6));
}
function iaqFromVoc(v){
  if(v<50) return Math.round(v*.8+10);
  if(v<200) return Math.round(50+(v-50)*.8);
  if(v<500) return Math.round(170+(v-200)*.48);
  return Math.min(500,Math.round(314+(v-500)*.22));
}
function rssiFromSig(s){
  var b=s>=4?-61:s>=3?-72:-80;
  return Math.round(b-Math.random()*5);
}
function hexToRgb(hex){hex=hex.replace('#','');return parseInt(hex.slice(0,2),16)+','+parseInt(hex.slice(2,4),16)+','+parseInt(hex.slice(4,6),16)}
function riskColor(s){return s>=90?'#ef4444':s>=75?'#f97316':s>=50?'#eab308':'#22c55e'}
function riskLabel(s){return s>=90?'CRITICAL':s>=75?'HIGH':s>=50?'MODERATE':'LOW'}
function numFlash(el){el.classList.remove('nf');void el.offsetWidth;el.classList.add('nf')}

// ── LIVE DRONE STATE ──
var LD={
  flood:{
    score:87,
    drones:[
      {id:'SNT-001',dot:'active',state:'Scanning',  batt:91,alt:62.1,spd:7.2,hdg:142,sig:4,t:84.2,h:97.14,p:29.413,voc:34, lat:30.01350,lng:-99.80200,rssi:-64,cpu:11,mcu_t:40,seq:8247,gas_r:0,iaq:0},
      {id:'SNT-002',dot:'transit',state:'In Transit',batt:83,alt:71.4,spd:9.8,hdg:218,sig:4,t:83.8,h:96.83,p:29.391,voc:31, lat:30.00550,lng:-99.78600,rssi:-67,cpu:13,mcu_t:42,seq:6103,gas_r:0,iaq:0},
      {id:'SNT-003',dot:'active',state:'Scanning',  batt:77,alt:58.8,spd:6.5,hdg:87, sig:3,t:83.5,h:97.41,p:29.402,voc:28, lat:29.99400,lng:-99.78000,rssi:-74,cpu:10,mcu_t:39,seq:5891,gas_r:0,iaq:0},
      {id:'SNT-004',dot:'delivery',state:'Delivering',batt:68,alt:45.2,spd:11.2,hdg:310,sig:4,t:84.0,h:97.02,p:29.381,voc:33,lat:30.00800,lng:-99.81200,rssi:-63,cpu:14,mcu_t:44,seq:7428,gas_r:0,iaq:0},
      {id:'SNT-005',dot:'active',state:'Scanning',  batt:55,alt:74.0,spd:7.8,hdg:195,sig:3,t:84.4,h:97.58,p:29.424,voc:36, lat:30.02100,lng:-99.80600,rssi:-76,cpu:12,mcu_t:41,seq:4812,gas_r:0,iaq:0}
    ],
    features:[{n:'Pressure Vel.',v:'-0.18 inHg/hr',hot:true},{n:'Humidity Delta',v:'+4.3%/hr',hot:true},{n:'Gas Resistance',v:'Nominal (48 kΩ)',hot:false},{n:'Wind Shear Est.',v:'Moderate',hot:false}],
    ppFields:{dp:'-0.18 inHg/hr',dh:'+4.3%/hr',dgr:'-2.1 kΩ/hr',th:'0.62°',ws:'Moderate'},
    sub:'Flood imminent · 3 critical detections'
  },
  quake:{
    score:79,
    drones:[
      {id:'SNT-011',dot:'active',state:'Scanning',  batt:79,alt:55.3,spd:6.1,hdg:78, sig:4,t:72.4,h:44.83,p:29.882,voc:342,lat:31.04600,lng:-104.83500,rssi:-61,cpu:12,mcu_t:41,seq:9312,gas_r:0,iaq:0},
      {id:'SNT-012',dot:'delivery',state:'Delivering',batt:58,alt:40.1,spd:10.5,hdg:245,sig:3,t:72.1,h:45.21,p:29.891,voc:28, lat:31.04400,lng:-104.82800,rssi:-75,cpu:14,mcu_t:43,seq:7204,gas_r:0,iaq:0},
      {id:'SNT-013',dot:'active',state:'Scanning',  batt:85,alt:68.4,spd:7.3,hdg:132,sig:4,t:72.6,h:44.51,p:29.873,voc:318,lat:31.04200,lng:-104.82500,rssi:-62,cpu:11,mcu_t:40,seq:8801,gas_r:0,iaq:0},
      {id:'SNT-014',dot:'transit',state:'In Transit',batt:66,alt:50.0,spd:9.2,hdg:290,sig:4,t:72.3,h:44.91,p:29.880,voc:31, lat:31.05000,lng:-104.83800,rssi:-65,cpu:13,mcu_t:42,seq:6530,gas_r:0,iaq:0},
      {id:'SNT-015',dot:'active',state:'Scanning',  batt:92,alt:72.2,spd:6.8,hdg:15,  sig:4,t:72.5,h:45.12,p:29.901,voc:15, lat:31.04750,lng:-104.83400,rssi:-60,cpu:10,mcu_t:39,seq:9907,gas_r:0,iaq:0}
    ],
    features:[{n:'VOC Spike',v:'342 ppb (GAS LEAK)',hot:true},{n:'Dust / PM2.5',v:'+64 AQI/hr',hot:true},{n:'Aftershock Risk',v:'HIGH (M4.2+)',hot:true},{n:'Gas Resistance',v:'3.2 kΩ (LOW)',hot:true}],
    ppFields:{dp:'-0.05 inHg/hr',dh:'+1.2%/hr',dgr:'-18 kΩ/hr',th:'0.31°',ws:'Calm'},
    sub:'M5.8 post-event · 4 gas leak signatures'
  },
  fire:{
    score:94,
    drones:[
      {id:'SNT-021',dot:'active',state:'Scanning',  batt:74,alt:95.4,spd:8.5,hdg:63, sig:3,t:104.3,h:11.24,p:29.621,voc:890, lat:32.40800,lng:-98.83000,rssi:-73,cpu:14,mcu_t:47,seq:11420,gas_r:0,iaq:0},
      {id:'SNT-022',dot:'delivery',state:'Delivering',batt:51,alt:38.2,spd:12.1,hdg:182,sig:3,t:103.8,h:11.53,p:29.604,voc:712, lat:32.40200,lng:-98.81500,rssi:-71,cpu:16,mcu_t:48,seq:8843,gas_r:0,iaq:0},
      {id:'SNT-023',dot:'active',state:'Scanning',  batt:88,alt:110.1,spd:7.9,hdg:118,sig:4,t:104.8,h:10.91,p:29.633,voc:1024,lat:32.41400,lng:-98.82200,rssi:-64,cpu:13,mcu_t:46,seq:12071,gas_r:0,iaq:0},
      {id:'SNT-024',dot:'transit',state:'In Transit',batt:62,alt:72.0,spd:10.8,hdg:335,sig:3,t:103.5,h:11.81,p:29.612,voc:524, lat:32.39600,lng:-98.79200,rssi:-72,cpu:15,mcu_t:46,seq:9214,gas_r:0,iaq:0},
      {id:'SNT-025',dot:'active',state:'Scanning',  batt:80,alt:88.3,spd:8.2,hdg:54,  sig:4,t:104.1,h:11.13,p:29.624,voc:756, lat:32.41400,lng:-98.82200,rssi:-67,cpu:12,mcu_t:45,seq:10388,gas_r:0,iaq:0}
    ],
    features:[{n:'Temperature',v:'104.3°F (+3.8/hr)',hot:true},{n:'VOC / Smoke',v:'890 ppb (CRIT)',hot:true},{n:'Humidity',v:'11.2% (−4.1/hr)',hot:true},{n:'Gas Resistance',v:'0.84 kΩ (CRIT)',hot:true}],
    ppFields:{dp:'-0.02 inHg/hr',dh:'-4.1%/hr',dgr:'-1.2 kΩ/hr',th:'1.41°',ws:'Severe NE'},
    sub:'Active fire front · 94/100 · immediate threat'
  }
};

// Compute gas_r and iaq for all drones on init
Object.keys(LD).forEach(function(s){
  LD[s].drones.forEach(function(d){d.gas_r=gasFromVoc(d.voc);d.iaq=iaqFromVoc(d.voc)});
});

var sparkData={};
var frameCounter={};

// ── RENDER FUNCTIONS ──
function renderStats(a){document.getElementById('stats').innerHTML=a.map(function(s){return'<div class="sb"><div class="sn" style="color:'+s.c+'">'+s.v+'</div><div class="sl">'+s.l+'</div></div>'}).join('')}
function renderFleet(a){
  document.getElementById('fleet').innerHTML=a.map(function(f){
    var d=null;
    var ld=LD[curScene];
    if(ld) ld.drones.forEach(function(x){if(x.id===f.id)d=x});
    var bc=f.batt>70?'hi':f.batt>40?'md':'lo';
    var bcol=f.batt>70?'#22c55e':f.batt>40?'#eab308':'#ef4444';
    var sub=d?'<div class="fi-sub"><b>'+d.alt.toFixed(0)+'m</b>&nbsp;AGL &nbsp; <b>'+d.spd.toFixed(1)+'</b>&nbsp;m/s &nbsp; <b>'+d.hdg+'°</b></div>':'';
    var volt=d?'<span style="color:'+bcol+';font-size:8.5px;font-family:JetBrains Mono,monospace">'+voltFromBatt(f.batt)+'V</span> ':''
    return '<div class="fi"><div class="fi-top"><span class="fdot '+f.dot+'"></span><span class="fid">'+f.id+'</span><span class="fst">'+f.state+'</span>'
      +volt
      +'<div class="fbatt-wrap"><div class="fb"><div class="ff '+bc+'" style="width:'+f.batt+'%"></div></div>'
      +'<span class="fv-n" style="color:'+bcol+'">'+Math.round(f.batt)+'%</span></div></div>'
      +sub+'</div>'
  }).join('')
}
function renderAlerts(a){
  document.getElementById('alerts').innerHTML=a.map(function(x){
    return '<div class="al s'+x.sev+'"><div class="al-top"><span class="al-name">'+x.name+'</span><span class="al-conf '+x.cCls+'">'+x.conf+'</span></div><div class="al-desc">'+x.desc+'</div><div class="al-foot"><span>'+x.time+'</span><span>'+x.drone+'</span></div></div>'
  }).join('')
}
function renderHud(a){
  document.getElementById('hud').innerHTML=a.map(function(h,i){
    return (i?'<div class="hsep2"></div>':'')+'<div class="hi-item"><div class="hi-val" style="color:'+h.c+'">'+h.v+'</div><div class="hi-lbl">'+h.l+'</div></div>'
  }).join('')
}
function renderWx(a){
  document.getElementById('wx').innerHTML=a.map(function(w){
    return '<div class="wx-c"><div class="wx-l">'+w.l+'</div><div class="wx-v">'+w.v+'<span class="wx-u"> '+w.u+'</span></div><div class="wx-d '+w.dir+'">'+w.d+'</div></div>'
  }).join('')
}
function renderCmp(a){
  document.getElementById('cmp').innerHTML=
    '<div class="cmp-head"><span style="flex:1"></span><div class="cmp-vs"><span class="cs" style="min-width:60px;text-align:right;font-size:9px">Sentinel</span><span class="ca" style="min-width:60px;text-align:right;font-size:9px">Public API</span></div></div>'+
    a.map(function(r){return '<div class="cmp-row"><span class="cmp-m">'+r.m+'</span><div class="cmp-vs"><span class="cv s">'+r.s+'</span><span class="cv a">'+r.a+'</span></div></div>'}).join('')
}
function renderTickets(a){
  var scol={Dispatched:'#22c55e','En Route':'#3b82f6',Pending:'#8b89a0'};
  document.getElementById('tickets').innerHTML=a.map(function(t){
    var sc=scol[t.status]||'#8b89a0';
    var sb=t.status==='Dispatched'?'rgba(34,197,94,.12)':t.status==='En Route'?'rgba(59,130,246,.12)':'rgba(255,255,255,.05)';
    var sbr=t.status==='Dispatched'?'rgba(34,197,94,.25)':t.status==='En Route'?'rgba(59,130,246,.25)':'rgba(255,255,255,.1)';
    return '<div class="tk t'+t.p[0]+'"><div class="tk-in">'
      +'<div class="tk-head"><div class="tk-id-w"><span class="tk-id">'+t.id+'</span><span class="tk-pr '+t.p+'">'+t.p+'</span></div>'
      +'<span style="font-size:9px;font-weight:600;padding:2px 8px;border-radius:4px;color:'+sc+';background:'+sb+';border:1px solid '+sbr+'">'+t.status+'</span></div>'
      +'<div class="tk-title">'+t.t+'</div><div class="tk-desc">'+t.desc+'</div>'
      +'<div class="tk-gps"><svg class="gps-ico" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>'
      +'<div><div class="gps-lbl">GPS Coordinates</div><div class="gps-co">'+t.gps+'</div></div></div>'
      +'<div class="tk-meta"><div class="tm-it"><div class="tm-l">Assigned Drone</div><div class="tm-v" style="color:#a78bfa">'+t.drone+'</div></div>'
      +'<div class="tm-it"><div class="tm-l">ETA to Target</div><div class="tm-v">'+t.eta+'</div></div></div>'
      +'<div class="tk-tags">'+t.tags.map(function(tg){return '<span class="tag">'+tg+'</span>'}).join('')+'</div>'
      +'<div class="tk-acts"><button class="btn btn-p">Approve &amp; Dispatch</button><button class="btn btn-g">View on Map</button></div>'
      +'</div></div>'
  }).join('')
}

// ── RISK ENGINE ──
function renderRisk(scene){
  var ld=LD[scene];if(!ld)return;
  var sc=Math.round(ld.score),col=riskColor(sc),lbl=riskLabel(sc);
  var e=document.getElementById('re-sc'),b=document.getElementById('re-bar'),lv=document.getElementById('re-lv'),ft=document.getElementById('re-feats');
  if(e){e.textContent=sc;e.style.color=col;numFlash(e)}
  if(b){b.style.width=sc+'%';b.style.background=col}
  if(lv){lv.textContent=lbl;lv.style.color=col;lv.style.background='rgba('+hexToRgb(col)+',.1)';lv.style.border='1px solid rgba('+hexToRgb(col)+',.2)'}
  if(ft&&ld.features) ft.innerHTML=ld.features.map(function(f){
    return '<div class="re-feat"><span class="re-fn">'+f.n+'</span><span class="re-fv" style="color:'+(f.hot?col:'var(--t2)')+'">'+f.v+'</span></div>'
  }).join('');
  setPP(scene);
}
function setPP(scene){
  var ld=LD[scene];if(!ld)return;
  var d=ld.drones[0];
  var sc=Math.round(ld.score),col=riskColor(sc),lbl=riskLabel(sc);
  var se=function(id,val,clr){var e=document.getElementById(id);if(e){e.textContent=val;if(clr)e.style.color=clr}};
  var tc=(((d.t-32)*5)/9).toFixed(2);
  var hpa=(d.p*33.8639).toFixed(2);
  var gas=d.gas_r>1000?(d.gas_r/1000).toFixed(1)+' kΩ':d.gas_r+' Ω';
  se('pp-t',tc+'°C / '+d.t.toFixed(1)+'°F', d.t>100?'#ef4444':d.t>90?'#f97316':'#c4c2d9');
  se('pp-h',d.h.toFixed(2)+'%', d.h>90?'#3b82f6':d.h<20?'#f97316':'#c4c2d9');
  se('pp-p',hpa+' hPa','#c4c2d9');
  se('pp-g',gas, d.gas_r<2000?'#ef4444':d.gas_r<8000?'#f97316':'#22c55e');
  se('pp-iaq',d.iaq, d.iaq>200?'#ef4444':d.iaq>100?'#f97316':'#22c55e');
  se('pp-a',d.alt.toFixed(1)+' m','#c4c2d9');
  var pf=ld.ppFields;
  se('pp-dp',pf.dp);se('pp-dh',pf.dh);se('pp-dgr',pf.dgr,d.gas_r<2000?'#ef4444':'#8b89a0');
  se('pp-th',pf.th);se('pp-ws',pf.ws);
  var ps=document.getElementById('pp-sc');if(ps){ps.textContent=sc;ps.style.color=col;numFlash(ps)}
  var pb=document.getElementById('pp-bf');if(pb){pb.style.width=sc+'%';pb.style.background=col}
  var pl=document.getElementById('pp-lv');if(pl){pl.textContent=lbl+' RISK';pl.style.color=col}
  var su=document.getElementById('pp-sub');if(su)su.textContent=ld.sub;
  var pi=document.getElementById('pp-inf');if(pi)pi.textContent=document.getElementById('h-inf').textContent;
}

// ── DRONE CARDS ──
function renderCards(scene){
  var drones=LD[scene].drones;
  var area=document.getElementById('dc-area');if(!area)return;
  area.innerHTML=drones.map(function(d){
    if(!sparkData[d.id]) sparkData[d.id]=[];
    sparkData[d.id].push(d.iaq);
    if(sparkData[d.id].length>20) sparkData[d.id].shift();
    var bcol=d.batt>70?'#22c55e':d.batt>40?'#eab308':'#ef4444';
    var tCls=d.t>100?'hot':d.t>90?'warn':'dim';
    var hCls=d.h>90?'ok':d.h<20?'hot':'dim';
    var iCls=d.iaq>200?'hot':d.iaq>100?'warn':'ok';
    var gCls=d.gas_r<2000?'hot':d.gas_r<8000?'warn':'ok';
    var gas=d.gas_r>1000?(d.gas_r/1000).toFixed(1)+' kΩ':d.gas_r+' Ω';
    var tc=(((d.t-32)*5)/9).toFixed(2);
    var hpa=(d.p*33.8639).toFixed(2);
    var volt=voltFromBatt(d.batt);
    var sigH='<div class="sig">'+[1,2,3,4].map(function(i){
      return '<div class="sb2'+(i<=d.sig?' on':'')+(i<=d.sig&&d.sig<=2?' wn':'')+'" style="height:'+(i*2+3)+'px"></div>'
    }).join('')+'</div>';
    var spark=buildSparkline(sparkData[d.id], d.iaq>200?'#ef4444':d.iaq>100?'#f97316':'#a78bfa','IAQ');
    var latStr=d.lat.toFixed(4)+'°N';
    var lngStr=Math.abs(d.lng).toFixed(4)+'°W';
    return '<div class="dc">'
      +'<div class="dc-h"><span class="dc-id">'+d.id+'</span>'
      +'<div class="dc-sg"><div class="dc-sd '+d.dot+'"></div><span class="dc-st">'+d.state+'</span></div></div>'
      +'<div class="dc-body">'
      +'<div class="dc-r"><span class="dc-k">Temp (°C)</span><span class="dc-v '+tCls+'">'+tc+'°C</span><span class="dc-d '+(d.t>90?'up':'fl')+'">'+( d.t>90?'↑':'~')+'</span></div>'
      +'<div class="dc-r"><span class="dc-k">Humidity</span><span class="dc-v '+hCls+'">'+d.h.toFixed(2)+'%</span><span class="dc-d '+(d.h>90?'up':d.h<20?'dn':'fl')+'">'+( d.h>90?'↑':d.h<20?'↓':'~')+'</span></div>'
      +'<div class="dc-r"><span class="dc-k">Pressure</span><span class="dc-v dim">'+hpa+' hPa</span><span class="dc-d dn">↓</span></div>'
      +'<div class="dc-r"><span class="dc-k">Gas Resist.</span><span class="dc-v '+gCls+'">'+gas+'</span><span class="dc-d fl">~</span></div>'
      +'<div class="dc-r"><span class="dc-k">IAQ Index</span><span class="dc-v '+iCls+'">'+d.iaq+'</span><span class="dc-d '+(d.iaq>100?'up':'fl')+'">'+( d.iaq>100?'↑':'~')+'</span></div>'
      +'<div class="dc-r"><span class="dc-k">Alt AGL</span><span class="dc-v hi">'+d.alt.toFixed(1)+' m</span><span class="dc-d fl">─</span></div>'
      +'</div>'
      +'<div class="dc-ft">'
      +'<div class="dc-meta"><b>'+d.spd.toFixed(1)+'</b>m/s <b>'+d.hdg+'°</b> <b>'+d.rssi+'</b>dBm</div>'
      +'<div style="display:flex;align-items:center;gap:7px">'
      +sigH
      +'<span style="font-family:JetBrains Mono,monospace;font-size:8.5px;color:'+bcol+'">'+volt+'V</span>'
      +'</div></div>'
      +'<div class="dc-gps"><b>'+latStr+'</b> &nbsp; <b>'+lngStr+'</b> &nbsp; FIX:3D-DGPS</div>'
      +'<div class="dc-spark">'+spark+'</div>'
      +'</div>'
  }).join('');
}
function buildSparkline(data,col){
  if(!data||data.length<2) return '<svg class="dc-svg" viewBox="0 0 100 22"><line x1="0" y1="11" x2="100" y2="11" stroke="#1f1e2e" stroke-width="1"/></svg>';
  var min=Math.min.apply(null,data),max=Math.max.apply(null,data),range=max-min||1;
  var pts=data.map(function(v,i){return ((i/(data.length-1))*97+1)+','+(20-((v-min)/range)*18)});
  var area=pts.map(function(p,i){return(i?'L':'M')+p}).join(' ')+'L98,21 L1,21 Z';
  return '<svg class="dc-svg" viewBox="0 0 100 22" preserveAspectRatio="none">'
    +'<path d="'+area+'" fill="'+col+'" opacity=".07"/>'
    +'<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+col+'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
    +'</svg>';
}

// ── RAW TERMINAL FEED ──
var feedLines=[],feedCounter={};
function makeFeedLine(scene){
  var drones=LD[scene].drones;
  var d=drones[Math.floor(Math.random()*drones.length)];
  d.seq=(d.seq||0)+1;
  if(!feedCounter[d.id]) feedCounter[d.id]=0;
  var ft=feedCounter[d.id]%3; feedCounter[d.id]++;
  var now=new Date();
  var ts=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0')+':'+now.getSeconds().toString().padStart(2,'0')+'.'+Math.floor(Math.random()*900+100).toString().padStart(3,'0');
  var isAnom=(d.iaq>250||d.t>100||d.h<12);
  var isWarn=(d.iaq>100||d.t>90||d.h<22);
  var cls='fl'+(isAnom?' an':isWarn?' wn':'');
  var line='';
  if(ft===0){
    // SENSOR frame: temp, humidity, pressure, gas resistance, IAQ
    var tc=(((d.t-32)*5)/9).toFixed(2);
    var hpa=(d.p*33.8639).toFixed(2);
    var gas=d.gas_r>1000?(d.gas_r/1000).toFixed(1)+'kΩ':d.gas_r+'Ω';
    var tCol=d.t>100?'hot':d.t>90?'warn':'';
    var iCol=d.iaq>200?'hot':d.iaq>100?'warn':'ok';
    var gCol=d.gas_r<2000?'hot':d.gas_r<8000?'warn':'ok';
    line='<div class="'+cls+'">'
      +'<span class="ft">'+ts+'</span> <span class="fid">'+d.id+'</span> <span class="ftp">SENS</span>'
      +'  <span class="fk">T:</span><span class="fv'+(tCol?' '+tCol:'')+'">'+tc+'°C</span>'
      +' <span class="fk">H:</span><span class="fv">'+d.h.toFixed(2)+'%</span>'
      +' <span class="fk">P:</span><span class="fv">'+hpa+'hPa</span>'
      +' <span class="fk">GAS:</span><span class="fv '+gCol+'">'+gas+'</span>'
      +' <span class="fk">IAQ:</span><span class="fv '+iCol+'">'+d.iaq+'</span>'
      +'</div>';
  } else if(ft===1){
    // NAV frame: altitude, ground speed, heading, lat/lng
    line='<div class="'+cls+'">'
      +'<span class="ft">'+ts+'</span> <span class="fid">'+d.id+'</span> <span class="ftp">&nbsp;NAV</span>'
      +'  <span class="fk">ALT:</span><span class="fv hi">'+d.alt.toFixed(1)+'m</span>'
      +' <span class="fk">GS:</span><span class="fv">'+d.spd.toFixed(1)+'m/s</span>'
      +' <span class="fk">HDG:</span><span class="fv">'+d.hdg+'°</span>'
      +' <span class="fk">GPS:</span><span class="fv">'+d.lat.toFixed(4)+'N</span>'
      +'</div>';
  } else {
    // SYS frame: battery voltage, RSSI, CPU, MCU temp
    var volt=voltFromBatt(d.batt);
    var bCol=d.batt<30?'hot':d.batt<50?'warn':'ok';
    line='<div class="'+cls+'">'
      +'<span class="ft">'+ts+'</span> <span class="fid">'+d.id+'</span> <span class="ftp">&nbsp;SYS</span>'
      +'  <span class="fk">BATT:</span><span class="fv '+bCol+'">'+volt+'V('+Math.round(d.batt)+'%)</span>'
      +' <span class="fk">RSSI:</span><span class="fv '+(d.rssi<-74?'warn':'')+'">'+d.rssi+'dBm</span>'
      +' <span class="fk">CPU:</span><span class="fv">'+d.cpu+'%</span>'
      +' <span class="fk">MCU:</span><span class="fv">'+d.mcu_t+'°C</span>'
      +'</div>';
  }
  return line;
}
function initFeed(scene){
  feedLines=[]; feedCounter={};
  var now=new Date();
  // Pre-fill 60 historical lines across 3 frame types, staggered
  for(var i=60;i>=0;i--){
    var d=LD[scene].drones[Math.floor(Math.random()*LD[scene].drones.length)];
    d.seq=(d.seq||0)+1;
    if(!feedCounter[d.id]) feedCounter[d.id]=0;
    var ft=feedCounter[d.id]%3; feedCounter[d.id]++;
    var t2=new Date(now.getTime()-i*1800);
    var ts=t2.getHours().toString().padStart(2,'0')+':'+t2.getMinutes().toString().padStart(2,'0')+':'+t2.getSeconds().toString().padStart(2,'0')+'.'+Math.floor(Math.random()*900+100).toString().padStart(3,'0');
    var isAnom=(d.iaq>250||d.t>100||d.h<12);
    var isWarn=(d.iaq>100||d.t>90||d.h<22);
    var cls='fl'+(isAnom?' an':isWarn?' wn':'');
    var line='';
    if(ft===0){
      var tc=(((d.t-32)*5)/9).toFixed(2);var hpa=(d.p*33.8639).toFixed(2);
      var gas=d.gas_r>1000?(d.gas_r/1000).toFixed(1)+'kΩ':d.gas_r+'Ω';
      var tCol=d.t>100?'hot':d.t>90?'warn':'';
      var iCol=d.iaq>200?'hot':d.iaq>100?'warn':'ok';
      var gCol=d.gas_r<2000?'hot':d.gas_r<8000?'warn':'ok';
      line='<div class="'+cls+'"><span class="ft">'+ts+'</span> <span class="fid">'+d.id+'</span> <span class="ftp">SENS</span>'
        +'  <span class="fk">T:</span><span class="fv'+(tCol?' '+tCol:'')+'">'+tc+'°C</span>'
        +' <span class="fk">H:</span><span class="fv">'+d.h.toFixed(2)+'%</span>'
        +' <span class="fk">P:</span><span class="fv">'+hpa+'hPa</span>'
        +' <span class="fk">GAS:</span><span class="fv '+gCol+'">'+gas+'</span>'
        +' <span class="fk">IAQ:</span><span class="fv '+iCol+'">'+d.iaq+'</span></div>';
    } else if(ft===1){
      line='<div class="'+cls+'"><span class="ft">'+ts+'</span> <span class="fid">'+d.id+'</span> <span class="ftp">&nbsp;NAV</span>'
        +'  <span class="fk">ALT:</span><span class="fv hi">'+d.alt.toFixed(1)+'m</span>'
        +' <span class="fk">GS:</span><span class="fv">'+d.spd.toFixed(1)+'m/s</span>'
        +' <span class="fk">HDG:</span><span class="fv">'+d.hdg+'°</span>'
        +' <span class="fk">GPS:</span><span class="fv">'+d.lat.toFixed(4)+'N</span></div>';
    } else {
      var volt=voltFromBatt(d.batt);var bCol=d.batt<30?'hot':d.batt<50?'warn':'ok';
      line='<div class="'+cls+'"><span class="ft">'+ts+'</span> <span class="fid">'+d.id+'</span> <span class="ftp">&nbsp;SYS</span>'
        +'  <span class="fk">BATT:</span><span class="fv '+bCol+'">'+volt+'V('+Math.round(d.batt)+'%)</span>'
        +' <span class="fk">RSSI:</span><span class="fv '+(d.rssi<-74?'warn':'')+'">'+d.rssi+'dBm</span>'
        +' <span class="fk">CPU:</span><span class="fv">'+d.cpu+'%</span>'
        +' <span class="fk">MCU:</span><span class="fv">'+d.mcu_t+'°C</span></div>';
    }
    feedLines.push(line);
  }
}
function pushFeed(scene){
  var line=makeFeedLine(scene);
  feedLines.push(line);
  if(feedLines.length>150) feedLines.shift();
  var rf=document.getElementById('rf-body');
  if(rf) rf.innerHTML=feedLines.slice().reverse().join('');
}

function renderSVHeader(scene){
  var names={flood:'Hill Country Flood Response',quake:'Culberson County M5.8',fire:'Eastland Complex Wildfire'};
  var dc=document.getElementById('sv-cnt');if(dc)dc.textContent=(LD[scene]?LD[scene].drones.length:0)+' Drones Reporting';
  var ds=document.getElementById('sv-sc');if(ds)ds.textContent=names[scene]||'';
  var dt=document.getElementById('sv-ts');if(dt)dt.textContent='Last sync: '+new Date().toLocaleTimeString('en-US',{hour12:false});
}

// ── TIMELINE ──
var TL={
  flood:[
    {t:'09:34:11',d:'#ef4444',tx:'SNT-001 flagged 3 individuals on rooftop — Guadalupe River crossing, confidence 94.3%',b:'CRITICAL',bc:'#ef4444'},
    {t:'09:36:22',d:'#7c3aed',tx:'MSN-041 auto-generated — emergency supply drop, 2.8 kg payload, authorized',b:'MSN-041',bc:'#7c3aed'},
    {t:'09:38:05',d:'#ef4444',tx:'SNT-002 flagged elderly person — porch partially submerged, mobility limited, conf 91.1%',b:'CRITICAL',bc:'#ef4444'},
    {t:'09:39:18',d:'#3b82f6',tx:'RR 1340 southbound submerged 3.5 ft — 4 vehicles stranded, road depth rising 0.4 ft/min',b:'ROAD CLOSED',bc:'#3b82f6'},
    {t:'09:41:44',d:'#3b82f6',tx:'MSN-042 dispatched — SNT-002 en route, ETA 7 min, payload: Med Kit + beacon',b:'EN ROUTE',bc:'#3b82f6'},
    {t:'09:43:02',d:'#eab308',tx:'Pressure drop −0.18 inHg/hr, gas resistance falling — Town Creek flash flood predicted T−20 min',b:'PREDICTION',bc:'#eab308'},
    {t:'09:44:31',d:'#a78bfa',tx:'SNT-005 recon pass initiated — Town Creek sector, altitude 74 m, IAQ nominal',b:'RECON',bc:'#7c3aed'},
    {t:'09:46:09',d:'#22c55e',tx:'MSN-041 delivery confirmed — comm device within 1.8 ft of target, emergency beacon active',b:'DELIVERED',bc:'#22c55e'},
    {t:'09:48:17',d:'#f97316',tx:'FM 1340 bridge debris accumulation detected — load-bearing supports at risk',b:'HIGH',bc:'#f97316'},
    {t:'09:51:33',d:'#22c55e',tx:'Ground rescue team coordinated via delivered comm device — arrival ETA 12 min',b:'RESCUE',bc:'#22c55e'}
  ],
  quake:[
    {t:'11:02:04',d:'#f97316',tx:'M5.8 seismic event — Van Horn, Culberson Co. — Sentinel fleet auto-deployed via geofence trigger',b:'SEISMIC',bc:'#f97316'},
    {t:'11:04:19',d:'#a855f7',tx:'SNT-013 VOC spike 342 ppb, gas resistance 3.2 kΩ — gas rupture confirmed Van Horn Main St',b:'GAS LEAK',bc:'#a855f7'},
    {t:'11:05:31',d:'#ef4444',tx:'SNT-011 flagged 2 individuals — collapsed residential structure, thermal confirmed motion',b:'CRITICAL',bc:'#ef4444'},
    {t:'11:06:48',d:'#ef4444',tx:'SNT-015 confirmed commercial collapse — Broadway Ave — unknown occupant count',b:'CRITICAL',bc:'#ef4444'},
    {t:'11:08:02',d:'#7c3aed',tx:'MSN-078 generated — rescue supply drop, 3.1 kg, comm device + glow markers + first aid',b:'MSN-078',bc:'#7c3aed'},
    {t:'11:09:14',d:'#f97316',tx:'US-90 surface crack detected — both lanes blocked, emergency vehicle re-routing required',b:'ROAD',bc:'#f97316'},
    {t:'11:10:27',d:'#eab308',tx:'Aftershock probability: M4.2+ within 2 hrs, confidence 78% (USGS ML model overlay)',b:'AFTERSHOCK',bc:'#eab308'},
    {t:'11:12:41',d:'#3b82f6',tx:'MSN-078 en route — SNT-011 visual lock maintained, ETA 3 min, RSSI −61 dBm',b:'EN ROUTE',bc:'#3b82f6'}
  ],
  fire:[
    {t:'14:11:07',d:'#ef4444',tx:'Eastland Complex fire front confirmed — 7 zones critical, IAQ 412, Sentinel fleet deployed',b:'CRITICAL',bc:'#ef4444'},
    {t:'14:13:22',d:'#ef4444',tx:'SNT-021 flagged family of 4 — property surrounded by advancing fire, road CR-435 cut off',b:'CRITICAL',bc:'#ef4444'},
    {t:'14:14:09',d:'#f97316',tx:'VOC 890 ppb, gas resistance 0.84 kΩ, IAQ 412 — hazardous visibility, drone thermal required',b:'HAZMAT',bc:'#f97316'},
    {t:'14:15:31',d:'#7c3aed',tx:'MSN-103 generated — N95 (×4), water 4L, comm device, beacon — 4.2 kg total payload',b:'MSN-103',bc:'#7c3aed'},
    {t:'14:16:44',d:'#ef4444',tx:'Fire line advancing NE at 1.2 mi/hr, wind gusts 67 mph — 3 additional properties in path',b:'ADVANCING',bc:'#ef4444'},
    {t:'14:17:58',d:'#ef4444',tx:'SNT-021 flagged lone rancher on ridgeline, conf 87.3% — all descent routes blocked by fire',b:'CRITICAL',bc:'#ef4444'},
    {t:'14:19:11',d:'#22c55e',tx:'MSN-103 dispatched — SNT-021 ETA 2 min, ground speed 8.5 m/s, RSSI −73 dBm',b:'DISPATCHED',bc:'#22c55e'},
    {t:'14:21:03',d:'#22c55e',tx:'MSN-103 delivery confirmed — within 2.1 ft, family comm established, beacon transmitting',b:'DELIVERED',bc:'#22c55e'},
    {t:'14:22:46',d:'#7c3aed',tx:'MSN-104 generated — SNT-022 en route to ridgeline, ETA 8 min, rescue beacon + water',b:'MSN-104',bc:'#7c3aed'},
    {t:'14:24:18',d:'#f97316',tx:'Wind gusts 67 mph sustained NE — fire spread model updated, T−18 min to structure encroachment',b:'WIND',bc:'#f97316'}
  ]
};
function renderTimeline(scene){
  var evs=TL[scene]||[];
  var doubled=evs.concat(evs);
  var el=document.getElementById('tl-inner');if(!el)return;
  el.innerHTML=doubled.map(function(e){
    return '<div class="tl-ev">'
      +'<span class="tl-t">'+e.t+'</span>'
      +'<div class="tl-d" style="background:'+e.d+'"></div>'
      +'<span class="tl-tx">'+e.tx+'</span>'
      +'<span class="tl-bx" style="color:'+e.bc+';background:rgba('+hexToRgb(e.bc)+',.09);border:1px solid rgba('+hexToRgb(e.bc)+',.2)">'+e.b+'</span>'
      +'</div>'
  }).join('');
}

// ── SPLASH ──
var splashTO;
function showSplash(scene){
  var cfg={flood:{i:'🌊',c:'#3b82f6',t:'Hill Country Flood Response',s:'Blanco County TX · Active incident · 6 drones deployed'},
    quake:{i:'⚡',c:'#f97316',t:'Culberson County M5.8',s:'Van Horn TX · Post-seismic response · 5 drones deployed'},
    fire:{i:'🔥',c:'#ef4444',t:'Eastland Complex Wildfire',s:'Eastland County TX · Active fire front · 5 drones deployed'},
    stream:{i:'📡',c:'#22c55e',t:'Sensor Stream',s:'BME688 raw telemetry · ML inference pipeline active'}};
  var c=cfg[scene]||{};
  var sp=document.getElementById('splash');
  var ico=document.getElementById('sp-ico');var tt=document.getElementById('sp-t');var ss=document.getElementById('sp-s');
  if(ico){ico.textContent=c.i;ico.style.background='rgba('+hexToRgb(c.c||'#7c3aed')+',.12)';ico.style.border='1px solid rgba('+hexToRgb(c.c||'#7c3aed')+',.2)'}
  if(tt) tt.textContent=c.t;
  if(ss) ss.textContent=c.s;
  sp.classList.add('show');
  clearTimeout(splashTO);
  splashTO=setTimeout(function(){sp.classList.remove('show')},2200);
}

// ── LIVE TICK ──
var tickIntervals=[];
function clearTicks(){tickIntervals.forEach(clearInterval);tickIntervals=[]}
var lastMapScene='flood';
function startTick(scene){
  clearTicks();
  var t1=setInterval(function(){
    var ld=LD[scene];if(!ld)return;
    var drones=ld.drones;
    drones.forEach(function(d){
      var fac=scene==='fire'?1.4:scene==='flood'?0.7:0.35;
      d.t=parseFloat((d.t+(Math.random()-.4)*fac*.15).toFixed(2));
      d.h=parseFloat((d.h+(Math.random()-.4)*(scene==='fire'?-0.06:0.1)).toFixed(2));
      d.p=parseFloat((d.p+(Math.random()-.6)*.006).toFixed(3));
      d.voc=Math.max(5,Math.round(d.voc+(Math.random()-.38)*(scene==='fire'?11:scene==='quake'?3.5:.7)));
      d.gas_r=gasFromVoc(d.voc);
      d.iaq=iaqFromVoc(d.voc);
      d.alt=parseFloat(Math.max(30,Math.min(130,d.alt+(Math.random()-.5)*0.8)).toFixed(1));
      d.spd=parseFloat(Math.max(3,Math.min(14,d.spd+(Math.random()-.5)*.3)).toFixed(1));
      d.batt=parseFloat(Math.max(5,d.batt-.025).toFixed(1));
      d.rssi=rssiFromSig(d.sig);
      d.cpu=Math.round(Math.max(6,Math.min(22,d.cpu+(Math.random()-.5)*2)));
      d.mcu_t=Math.round(Math.max(36,Math.min(52,d.mcu_t+(Math.random()-.5))));
    });
    ld.score=Math.max(20,Math.min(99,ld.score+(Math.random()-.45)*.5));
    renderRisk(scene);
    // Update inference latency
    var inf=Math.round(130+Math.random()*35);
    var hi=document.getElementById('h-inf');if(hi)hi.textContent=inf+'ms';
    // GPS lock
    var gps=Math.random()>.05?'4/4':'3/4';
    var hg=document.getElementById('h-gps');if(hg){hg.textContent=gps;hg.className='hv'+(gps==='3/4'?' w':'');}
    // Packet rate
    var pkr=(10+Math.random()*5).toFixed(1);
    var hp=document.getElementById('h-pkt');if(hp)hp.textContent=pkr;
    // Sensor stream
    if(curScene==='stream'){
      pushFeed(lastMapScene);
      renderCards(lastMapScene);
      renderSVHeader(lastMapScene);
      setPP(lastMapScene);
    }
  },2500);
  tickIntervals.push(t1);
  var t2=setInterval(function(){
    var ts=document.getElementById('sv-ts');
    if(ts)ts.textContent='Last sync: '+new Date().toLocaleTimeString('en-US',{hour12:false});
  },5000);
  tickIntervals.push(t2);
}

// ── SCENARIO DATA ──
var S={
flood:{
  center:[30.01,-99.80],zoom:14,
  wxTitle:'Hyperlocal Weather — Blanco Co., TX',
  hud:[{v:'8',l:'Flood Zones',c:'#3b82f6'},{v:'3',l:'Victims Flagged',c:'#ef4444'},{v:'4',l:'Roads Blocked',c:'#f97316'},{v:'6',l:'Drones Active',c:'#a78bfa'}],
  stats:[{v:'6',l:'Active',c:'#22c55e'},{v:'5',l:'Alerts',c:'#a78bfa'},{v:'3',l:'Missions',c:'#f97316'}],
  fleet:[{id:'SNT-001',dot:'active',state:'Scanning',batt:91},{id:'SNT-002',dot:'transit',state:'In Transit',batt:83},{id:'SNT-003',dot:'active',state:'Scanning',batt:77},{id:'SNT-004',dot:'delivery',state:'Delivering',batt:68},{id:'SNT-005',dot:'active',state:'Scanning',batt:55},{id:'SNT-006',dot:'standby',state:'Standby',batt:100}],
  alerts:[
    {name:'Stranded Individuals (3)',sev:'c',conf:'94.3%',cCls:'hi',desc:'3 people on rooftop near Guadalupe River crossing. Water rising at 0.83 ft/hr.',time:'2m 14s ago',drone:'SNT-001'},
    {name:'Road Submerged: RR 1340',sev:'c',conf:'98.1%',cCls:'hi',desc:'RR 1340 southbound submerged ~3.5 ft. 4 vehicles stranded. Rising 0.4 ft/min.',time:'5m ago',drone:'SNT-003'},
    {name:'Elderly Person Flagged',sev:'c',conf:'91.1%',cCls:'hi',desc:'Mobility-limited individual on porch, structure partially submerged.',time:'8m ago',drone:'SNT-002'},
    {name:'Flash Flood Prediction',sev:'h',conf:'88.4%',cCls:'hi',desc:'Pressure drop 0.18 inHg/hr, gas resistance falling. Town Creek sector: T−20 min.',time:'11m ago',drone:'SNT-005'},
    {name:'Bridge Debris Buildup',sev:'h',conf:'82.7%',cCls:'md',desc:'Debris accumulating on FM 1340 bridge supports. Load-bearing integrity at risk.',time:'14m ago',drone:'SNT-004'}
  ],
  wx:[{l:'Temperature',v:'84.2',u:'°F',d:'+2.1°/hr',dir:'up'},{l:'Humidity',v:'97.1',u:'%',d:'+4.3%/hr',dir:'up'},{l:'Pressure',v:'29.41',u:'inHg',d:'−0.18/hr',dir:'dn'},{l:'Wind Speed',v:'34',u:'mph',d:'+8 mph/hr',dir:'up'},{l:'Rainfall Rate',v:'3.2',u:'in/hr',d:'+1.1/hr',dir:'up'},{l:'Visibility',v:'0.4',u:'mi',d:'−0.3/hr',dir:'dn'}],
  cmp:[{m:'Temperature',s:'84.2°F',a:'82°F'},{m:'Humidity',s:'97.14%',a:'89%'},{m:'Pressure',s:'29.41 inHg',a:'29.52 inHg'},{m:'Wind',s:'34 mph NE',a:'22 mph N'},{m:'Rainfall',s:'3.2 in/hr',a:'1.8 in/hr'}],
  tickets:[
    {id:'MSN-041',p:'critical',status:'Dispatched',t:'Emergency Supply Drop — Rooftop Victims',
    desc:'Three individuals confirmed on rooftop 0.4 mi SE of Guadalupe River. Structure partially submerged. SNT-001 has sustained visual lock. Water rising at 0.83 ft/hr.',
    gps:'30.0121° N, 99.7998° W',drone:'SNT-001',eta:'3m 42s',tags:['Comm Device','First Aid Kit','Water 2L','Emergency Beacon']},
    {id:'MSN-042',p:'critical',status:'En Route',t:'Medical Drop — Elderly Resident',
    desc:'Mobility-limited individual on porch of partially submerged residence. SNT-002 visual lock active. Porch flooding in ~11 min.',
    gps:'30.0040° N, 99.7880° W',drone:'SNT-002',eta:'7m 08s',tags:['Med Kit','Emergency Beacon','Thermal Blanket']},
    {id:'MSN-043',p:'high',status:'Pending',t:'Recon Pass — Town Creek Flood Risk',
    desc:'Pressure velocity and humidity delta indicate flash flood in Town Creek sector within 20 min. SNT-005 assigned for low-altitude recon sweep.',
    gps:'30.0200° N, 99.8080° W',drone:'SNT-005',eta:'11m',tags:['Sensor Buoy','Water Marker']}
  ],
  zones:[{c:[[30.018,-99.812],[30.014,-99.798],[30.004,-99.795],[30.000,-99.810],[30.008,-99.818]],col:'#ef4444',o:.45},{c:[[30.002,-99.792],[29.996,-99.780],[29.988,-99.785],[29.990,-99.798]],col:'#ef4444',o:.42},{c:[[30.013,-99.804],[30.010,-99.797],[30.006,-99.799],[30.008,-99.806]],col:'#ef4444',o:.55},{c:[[30.022,-99.820],[30.018,-99.802],[30.010,-99.806],[30.012,-99.822]],col:'#f97316',o:.38},{c:[[29.994,-99.778],[29.988,-99.764],[29.980,-99.770],[29.984,-99.785]],col:'#f97316',o:.38},{c:[[30.006,-99.808],[30.002,-99.798],[29.996,-99.800],[29.998,-99.810]],col:'#f97316',o:.35},{c:[[30.028,-99.808],[30.024,-99.792],[30.018,-99.796],[30.020,-99.812]],col:'#eab308',o:.32},{c:[[29.980,-99.802],[29.976,-99.790],[29.970,-99.795],[29.974,-99.806]],col:'#eab308',o:.30},{c:[[30.032,-99.796],[30.028,-99.782],[30.022,-99.786],[30.025,-99.800]],col:'#22c55e',o:.28},{c:[[29.975,-99.814],[29.971,-99.800],[29.965,-99.805],[29.968,-99.818]],col:'#22c55e',o:.25}],
  crit:[{lat:30.0121,lng:-99.7998,col:'#ef4444',pop:'<strong style="color:#ef4444">⚠ CRITICAL: 3 Stranded</strong><br>Rooftop, Guadalupe River area<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">30.0121°N, 99.7998°W</span><br>Conf: 94.3% · Water +0.83 ft/hr<br><span style="color:#3d3b52">SNT-001 · 2m 14s ago</span>'},{lat:30.0040,lng:-99.7880,col:'#ef4444',pop:'<strong style="color:#ef4444">⚠ CRITICAL: Elderly Person</strong><br>Porch, partially submerged<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">30.0040°N, 99.7880°W</span><br>Conf: 91.1%<br><span style="color:#3d3b52">SNT-002 · 8m ago</span>'}],
  dots:[{lat:29.9960,lng:-99.7820,col:'#3b82f6',r:8,pop:'<strong style="color:#3b82f6">Road Submerged</strong><br>RR 1340 southbound, ~3.5 ft<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">29.9960°N, 99.7820°W</span><br><span style="color:#3d3b52">SNT-003 · 5m ago</span>'},{lat:30.0100,lng:-99.8140,col:'#3b82f6',r:7,pop:'<strong style="color:#3b82f6">Bridge Debris</strong><br>FM 1340 bridge<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">30.0100°N, 99.8140°W</span><br><span style="color:#3d3b52">SNT-004 · 14m ago</span>'},{lat:30.0200,lng:-99.8080,col:'#f97316',r:8,pop:'<strong style="color:#f97316">Flash Flood Warning</strong><br>Town Creek sector — T−20 min<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">30.0200°N, 99.8080°W</span><br>Conf: 88.4%<br><span style="color:#3d3b52">SNT-005 · 11m ago</span>'}],
  paths:[{from:[30.0135,-99.8020],to:[30.0121,-99.7998],col:'#22c55e'},{from:[30.0055,-99.7860],to:[30.0040,-99.7880],col:'#3b82f6'}]
},
quake:{
  center:[31.044,-104.832],zoom:15,
  wxTitle:'Hyperlocal Readings — Culberson Co., TX',
  hud:[{v:'9',l:'Damage Zones',c:'#f97316'},{v:'5',l:'Victims Flagged',c:'#ef4444'},{v:'4',l:'Gas Leaks',c:'#a855f7'},{v:'5',l:'Drones Active',c:'#a78bfa'}],
  stats:[{v:'5',l:'Active',c:'#22c55e'},{v:'7',l:'Alerts',c:'#a78bfa'},{v:'2',l:'Missions',c:'#f97316'}],
  fleet:[{id:'SNT-011',dot:'active',state:'Scanning',batt:79},{id:'SNT-012',dot:'delivery',state:'Delivering',batt:58},{id:'SNT-013',dot:'active',state:'Scanning',batt:85},{id:'SNT-014',dot:'transit',state:'In Transit',batt:66},{id:'SNT-015',dot:'active',state:'Scanning',batt:92}],
  alerts:[
    {name:'Trapped Individuals (2)',sev:'c',conf:'92.3%',cCls:'hi',desc:'2 people under partial collapse. Thermal imaging confirms motion in east wing rubble.',time:'3m ago',drone:'SNT-011'},
    {name:'Gas Leak: Van Horn Main St',sev:'c',conf:'96.4%',cCls:'hi',desc:'VOC spike 342 ppb, gas resistance 3.2 kΩ. Gas rupture confirmed. Evacuate 200m.',time:'6m ago',drone:'SNT-013'},
    {name:'Structure Collapse',sev:'c',conf:'97.1%',cCls:'hi',desc:'Commercial building Broadway Ave fully collapsed. Unknown occupant count.',time:'9m ago',drone:'SNT-015'},
    {name:'Road Surface Displacement',sev:'h',conf:'89.2%',cCls:'hi',desc:'Major crack across US-90. Both lanes blocked. Emergency vehicles re-routed.',time:'12m ago',drone:'SNT-014'},
    {name:'Person on Damaged Balcony',sev:'h',conf:'86.0%',cCls:'md',desc:'Individual on 2nd-floor balcony, load-bearing shear cracks detected.',time:'15m ago',drone:'SNT-011'}
  ],
  wx:[{l:'Temperature',v:'72.4',u:'°F',d:'Stable',dir:'fl'},{l:'Humidity',v:'44.8',u:'%',d:'+1.2%/hr',dir:'fl'},{l:'Pressure',v:'29.88',u:'inHg',d:'−0.05/hr',dir:'fl'},{l:'Wind Speed',v:'8',u:'mph',d:'Calm',dir:'fl'},{l:'PM2.5 AQI',v:'187',u:'AQI',d:'+64/hr',dir:'up'},{l:'Aftershock Risk',v:'HIGH',u:'',d:'M4.2+ likely',dir:'up'}],
  cmp:[{m:'Temperature',s:'72.41°F',a:'73°F'},{m:'Humidity',s:'44.83%',a:'42%'},{m:'Pressure',s:'29.88 inHg',a:'29.92 inHg'},{m:'PM2.5',s:'187 AQI',a:'120 AQI'},{m:'VOC Index',s:'342 ppb',a:'N/A'}],
  tickets:[
    {id:'MSN-078',p:'critical',status:'En Route',t:'Rescue Supply Drop — Collapsed Structure',
    desc:'Two individuals trapped under partial collapse. Thermal confirms motion, east wing. Aerial delivery only — aftershock risk HIGH, structure unstable.',
    gps:'31.0450° N, 104.8340° W',drone:'SNT-011',eta:'3m 12s',tags:['Comm Device','Emergency Beacon','First Aid Kit','Glow Marker']},
    {id:'MSN-079',p:'high',status:'Pending',t:'Supply Drop — Balcony Resident',
    desc:'Individual on 2nd-floor balcony, shear cracks in load-bearing walls. Stairwell not viable. Emergency beacon enables GPS tracking for ground rescue.',
    gps:'31.0480° N, 104.8320° W',drone:'SNT-012',eta:'6m',tags:['Emergency Beacon','Water 1L','Thermal Blanket']}
  ],
  zones:[{c:[[31.048,-104.838],[31.046,-104.830],[31.042,-104.831],[31.043,-104.839]],col:'#ef4444',o:.48},{c:[[31.045,-104.828],[31.043,-104.822],[31.040,-104.824],[31.041,-104.830]],col:'#ef4444',o:.45},{c:[[31.0455,-104.8345],[31.044,-104.8305],[31.0415,-104.8315],[31.0425,-104.835]],col:'#ef4444',o:.55},{c:[[31.050,-104.842],[31.048,-104.834],[31.044,-104.836],[31.046,-104.844]],col:'#a855f7',o:.38},{c:[[31.041,-104.836],[31.038,-104.828],[31.035,-104.831],[31.037,-104.838]],col:'#f97316',o:.40},{c:[[31.0445,-104.8285],[31.0425,-104.8245],[31.040,-104.8255],[31.0415,-104.8295]],col:'#f97316',o:.35},{c:[[31.052,-104.836],[31.050,-104.828],[31.047,-104.830],[31.049,-104.838]],col:'#eab308',o:.32},{c:[[31.0395,-104.832],[31.037,-104.826],[31.035,-104.828],[31.037,-104.834]],col:'#eab308',o:.30},{c:[[31.054,-104.830],[31.052,-104.824],[31.049,-104.826],[31.051,-104.832]],col:'#22c55e',o:.28},{c:[[31.056,-104.836],[31.053,-104.830],[31.051,-104.832],[31.053,-104.838]],col:'#22c55e',o:.25}],
  crit:[{lat:31.0450,lng:-104.8340,col:'#ef4444',pop:'<strong style="color:#ef4444">⚠ CRITICAL: 2 Trapped</strong><br>Collapsed structure, thermal confirmed<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">31.0450°N, 104.8340°W</span><br>Conf: 92.3%<br><span style="color:#3d3b52">SNT-011 · 3m ago</span>'},{lat:31.0430,lng:-104.8260,col:'#a855f7',pop:'<strong style="color:#a855f7">⚠ Gas Leak Confirmed</strong><br>VOC 342 ppb — GAS:3.2 kΩ — evacuate 200m<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">31.0430°N, 104.8260°W</span><br>IAQ: 280<br><span style="color:#3d3b52">SNT-013 · 6m ago</span>'},{lat:31.0470,lng:-104.8360,col:'#f97316',pop:'<strong style="color:#f97316">⚠ Structure Collapse</strong><br>Commercial, Broadway Ave<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">31.0470°N, 104.8360°W</span><br>Conf: 97.1%<br><span style="color:#3d3b52">SNT-015 · 9m ago</span>'}],
  dots:[{lat:31.0510,lng:-104.8400,col:'#eab308',r:7,pop:'<strong style="color:#eab308">Road Cracked</strong><br>US-90 surface displacement<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">31.0510°N, 104.8400°W</span><br><span style="color:#3d3b52">SNT-014 · 12m ago</span>'},{lat:31.0480,lng:-104.8320,col:'#f97316',r:7,pop:'<strong style="color:#f97316">Stranded Person</strong><br>2nd floor balcony, unstable<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">31.0480°N, 104.8320°W</span><br>Conf: 86.0%<br><span style="color:#3d3b52">SNT-011 · 15m ago</span>'}],
  paths:[{from:[31.0460,-104.8350],to:[31.0450,-104.8340],col:'#22c55e'},{from:[31.0440,-104.8280],to:[31.0480,-104.8320],col:'#3b82f6'}]
},
fire:{
  center:[32.40,-98.82],zoom:13,
  wxTitle:'Hyperlocal Weather — Eastland Co., TX',
  hud:[{v:'7',l:'Fire Zones',c:'#ef4444'},{v:'4',l:'Victims Flagged',c:'#ef4444'},{v:'6',l:'Smoke Zones',c:'#f97316'},{v:'5',l:'Drones Active',c:'#a78bfa'}],
  stats:[{v:'5',l:'Active',c:'#22c55e'},{v:'6',l:'Alerts',c:'#a78bfa'},{v:'2',l:'Missions',c:'#f97316'}],
  fleet:[{id:'SNT-021',dot:'active',state:'Scanning',batt:74},{id:'SNT-022',dot:'delivery',state:'Delivering',batt:51},{id:'SNT-023',dot:'active',state:'Scanning',batt:88},{id:'SNT-024',dot:'transit',state:'In Transit',batt:62},{id:'SNT-025',dot:'active',state:'Scanning',batt:80}],
  alerts:[
    {name:'Family Stranded (4)',sev:'c',conf:'93.2%',cCls:'hi',desc:'Family of 4 surrounded by advancing fire. Road CR-435 fully blocked. T−18 min to structure.',time:'1m ago',drone:'SNT-021'},
    {name:'VOC / PM2.5 Critical',sev:'c',conf:'99.0%',cCls:'hi',desc:'IAQ 412, gas resistance 0.84 kΩ, VOC 890 ppb. Hazardous. Thermal required.',time:'4m ago',drone:'SNT-023'},
    {name:'Fire Line Advancing NE',sev:'c',conf:'95.4%',cCls:'hi',desc:'Fire front at 1.2 mi/hr NE. 3 properties in path. Gusts 67 mph.',time:'7m ago',drone:'SNT-025'},
    {name:'Stranded Rancher',sev:'h',conf:'87.3%',cCls:'md',desc:'Individual on ridgeline, fire blocking all descent routes. Waving confirmed.',time:'10m ago',drone:'SNT-021'},
    {name:'Power Line Down',sev:'h',conf:'91.1%',cCls:'hi',desc:'Downed line sparking on FM 570. Secondary ignition risk.',time:'13m ago',drone:'SNT-024'}
  ],
  wx:[{l:'Temperature',v:'104.3',u:'°F',d:'+3.8°/hr',dir:'up'},{l:'Humidity',v:'11.2',u:'%',d:'−4.1%/hr',dir:'dn'},{l:'Wind Speed',v:'48',u:'mph',d:'+12 mph/hr',dir:'up'},{l:'Wind Gusts',v:'67',u:'mph',d:'Sustained',dir:'up'},{l:'PM2.5 AQI',v:'412',u:'AQI',d:'Hazardous',dir:'up'},{l:'Visibility',v:'0.2',u:'mi',d:'−0.5/hr',dir:'dn'}],
  cmp:[{m:'Temperature',s:'104.3°F',a:'96°F'},{m:'Humidity',s:'11.24%',a:'18%'},{m:'Wind',s:'48 mph NE',a:'31 mph N'},{m:'PM2.5',s:'412 AQI',a:'245 AQI'},{m:'VOC / Gas Resist.',s:'890 ppb / 0.84kΩ',a:'N/A'}],
  tickets:[
    {id:'MSN-103',p:'critical',status:'Dispatched',t:'Emergency Drop — Stranded Family of 4',
    desc:'Family of 4 confirmed at rural property, fire on three sides, road CR-435 blocked. IAQ 412. T−18 min before fire encroachment at current 1.2 mi/hr spread.',
    gps:'32.4060° N, 98.8280° W',drone:'SNT-021',eta:'1m 58s',tags:['N95 Masks ×4','Water 4L','Comm Device','Emergency Beacon']},
    {id:'MSN-104',p:'high',status:'En Route',t:'Supply Drop — Ridgeline Rancher',
    desc:'Individual on ridgeline, all descent routes blocked by fire. Visual lock maintained by SNT-021. Emergency beacon enables ground team GPS lock.',
    gps:'32.3960° N, 98.7980° W',drone:'SNT-022',eta:'8m 22s',tags:['Emergency Beacon','Water 2L','Thermal Blanket','Signal Mirror']}
  ],
  zones:[{c:[[32.415,-98.840],[32.410,-98.820],[32.398,-98.825],[32.400,-98.845]],col:'#ef4444',o:.52},{c:[[32.408,-98.815],[32.402,-98.795],[32.392,-98.802],[32.396,-98.820]],col:'#ef4444',o:.48},{c:[[32.406,-98.832],[32.402,-98.818],[32.396,-98.822],[32.400,-98.836]],col:'#ef4444',o:.58},{c:[[32.422,-98.855],[32.416,-98.835],[32.408,-98.840],[32.412,-98.858]],col:'#f97316',o:.42},{c:[[32.396,-98.798],[32.390,-98.780],[32.382,-98.788],[32.386,-98.804]],col:'#f97316',o:.40},{c:[[32.412,-98.824],[32.406,-98.808],[32.400,-98.812],[32.404,-98.828]],col:'#f97316',o:.38},{c:[[32.428,-98.840],[32.424,-98.822],[32.416,-98.828],[32.420,-98.845]],col:'#eab308',o:.34},{c:[[32.382,-98.810],[32.378,-98.796],[32.372,-98.802],[32.376,-98.815]],col:'#eab308',o:.32},{c:[[32.435,-98.830],[32.430,-98.814],[32.424,-98.820],[32.428,-98.836]],col:'#22c55e',o:.28},{c:[[32.370,-98.820],[32.366,-98.806],[32.360,-98.812],[32.364,-98.825]],col:'#22c55e',o:.25}],
  crit:[{lat:32.4060,lng:-98.8280,col:'#ef4444',pop:'<strong style="color:#ef4444">⚠ CRITICAL: Family of 4</strong><br>Surrounded by fire, road cut<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">32.4060°N, 98.8280°W</span><br>IAQ: 412 · T−18 min to structure<br><span style="color:#3d3b52">SNT-021 · 1m ago</span>'},{lat:32.4120,lng:-98.8200,col:'#ef4444',pop:'<strong style="color:#ef4444">⚠ Fire Line Advancing NE</strong><br>1.2 mi/hr · 3 properties in path<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">32.4120°N, 98.8200°W</span><br>Conf: 95.4%<br><span style="color:#3d3b52">SNT-025 · 7m ago</span>'},{lat:32.3960,lng:-98.7980,col:'#ef4444',pop:'<strong style="color:#ef4444">⚠ Stranded Rancher</strong><br>Ridgeline, all descent routes blocked<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">32.3960°N, 98.7980°W</span><br>Conf: 87.3%<br><span style="color:#3d3b52">SNT-021 · 10m ago</span>'}],
  dots:[{lat:32.4180,lng:-98.8420,col:'#f97316',r:8,pop:'<strong style="color:#f97316">Heavy Smoke Zone</strong><br>IAQ 412 — VOC 890 ppb<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">32.4180°N, 98.8420°W</span><br>Gas Resist: 0.84 kΩ<br><span style="color:#3d3b52">SNT-023 · 4m ago</span>'},{lat:32.3920,lng:-98.7900,col:'#eab308',r:7,pop:'<strong style="color:#eab308">Downed Power Line</strong><br>FM 570, sparking<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">32.3920°N, 98.7900°W</span><br><span style="color:#3d3b52">SNT-024 · 13m ago</span>'}],
  paths:[{from:[32.4080,-98.8300],to:[32.4060,-98.8280],col:'#22c55e'},{from:[32.4020,-98.8150],to:[32.3960,-98.7980],col:'#3b82f6'}]
}
};

// ── LOAD SCENE ──
function loadScene(name){
  curScene=name;
  var s=S[name];if(!s)return;
  lastMapScene=name;
  clearLayers();
  map.flyTo(s.center,s.zoom,{duration:1.1,easeLinearity:.4});
  setTimeout(function(){
    s.zones.forEach(function(z){addZone(z.c,z.col,z.o)});
    LD[name].drones.forEach(function(d){addCoverage(d.lat,d.lng)});
    if(s.paths) s.paths.forEach(function(p){addPath(p.from,p.to,p.col)});
    if(s.crit) s.crit.forEach(function(d){addCritDot(d.lat,d.lng,d.col,d.pop)});
    s.dots.forEach(function(d){addDot(d.lat,d.lng,d.col,d.r,d.pop)});
    LD[name].drones.forEach(function(d){addDrone(d)});
  },500);
  document.getElementById('wx-t').textContent=s.wxTitle;
  renderStats(s.stats);
  renderFleet(s.fleet);
  renderAlerts(s.alerts);
  renderHud(s.hud);
  renderWx(s.wx);
  renderCmp(s.cmp);
  renderTickets(s.tickets);
  renderRisk(name);
  renderTimeline(name);
  startTick(name);
}

// ── TABS ──
var layout=document.getElementById('layout');
var sv=document.getElementById('sv');
document.querySelectorAll('.tab').forEach(function(btn){
  btn.addEventListener('click',function(){
    document.querySelectorAll('.tab').forEach(function(b){b.classList.remove('on')});
    btn.classList.add('on');
    var sc=btn.dataset.s;
    showSplash(sc);
    if(sc==='stream'){
      layout.style.display='none';
      sv.classList.add('on');
      curScene='stream';
      initFeed(lastMapScene);
      renderCards(lastMapScene);
      renderSVHeader(lastMapScene);
      setPP(lastMapScene);
      renderTimeline(lastMapScene);
      var rf=document.getElementById('rf-body');
      if(rf) rf.innerHTML=feedLines.slice().reverse().join('');
    } else {
      sv.classList.remove('on');
      layout.style.display='grid';
      loadScene(sc);
    }
  });
});

// ── INIT ──
initFeed('flood');
loadScene('flood');
showSplash('flood');
</script>
</body>
</html>