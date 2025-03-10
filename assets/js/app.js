import socket from "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html"
// Establish Phoenix Socket and LiveView configuration.
import {Socket} from "phoenix"
import {LiveSocket} from "phoenix_live_view"
import topbar from "../vendor/topbar"

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, {
  longPollFallbackMs: 2500,
  params: {_csrf_token: csrfToken}
})

// Show progress bar on live navigation and form submits
topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"})
window.addEventListener("phx:page-loading-start", _info => topbar.show(300))
window.addEventListener("phx:page-loading-stop", _info => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket

String.prototype.hashCode = function() {
  var hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

const resX = 1680
const resY = 1050
const resSize = 5
const numX = resX / resSize
const numY = resY / resSize
const numBoxes = numX * numY
let colors = new Array(numBoxes).fill({ color: '#ffffff', user: null })
let dotColor = '#ff0000'
let user = localStorage.getItem('user') || null

const loader = document.getElementsByClassName('loader')[0]
const app = document.getElementById('app')

const startApp = function(notify) {
  const canvas = document.getElementById("dots-canvas")
  const ctx = canvas.getContext("2d", { alpha: false })

  const maxZoom = 10
  const scaleFactor = 1.05;
  let totalZoom = 1

  let tooltip = null

  function initCanvas() {
    app.classList.remove('visible')
    loader.classList.add('visible')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    console.log('Resolution: ' + numX + ' x ' + numY)

    canvas.padX = function() { return Math.max(0, (canvas.width - numX * resSize) / 2); }
    canvas.padY = function() { return Math.max(0, (canvas.height - numY * resSize) / 2); }

    redraw()
    app.classList.add('visible')
    loader.classList.remove('visible')
  }
  window.addEventListener("resize", initCanvas)

  function trackTransforms(ctx){
    var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
    var pt = svg.createSVGMatrix()
    var xform = svg.createSVGMatrix();
    ctx.getTransform = function(){ return xform; };

    var savedTransforms = [];
    var save = ctx.save;
    ctx.save = function(){
      savedTransforms.push(xform.translate(0,0));
      return save.call(ctx);
    };

    var restore = ctx.restore;
    ctx.restore = function(){
      xform = savedTransforms.pop();
      return restore.call(ctx);
    };

    var scale = ctx.scale;
    ctx.scale = function(sx,sy){
      xform = xform.scaleNonUniform(sx,sy);
      return scale.call(ctx,sx,sy);
    };

    var rotate = ctx.rotate;
    ctx.rotate = function(radians){
      xform = xform.rotate(radians*180/Math.PI);
      return rotate.call(ctx,radians);
    };

    var translate = ctx.translate;
    ctx.translate = function(dx,dy){
      xform = xform.translate(dx,dy);
      return translate.call(ctx,dx,dy);
    };

    var transform = ctx.transform;
    ctx.transform = function(a,b,c,d,e,f){
      var m2 = svg.createSVGMatrix();
      m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
      xform = xform.multiply(m2);
      return transform.call(ctx,a,b,c,d,e,f);
    };

    var setTransform = ctx.setTransform;
    ctx.setTransform = function(a,b,c,d,e,f){
      xform.a = a;
      xform.b = b;
      xform.c = c;
      xform.d = d;
      xform.e = e;
      xform.f = f;
      return setTransform.call(ctx,a,b,c,d,e,f);
    };

    var pt = svg.createSVGPoint()
    ctx.transformedPoint = function(x,y){
      pt.x=x; pt.y=y;
      return pt.matrixTransform(xform.inverse());
    }

    ctx.paddedPoint = function(x,y){
      var pt = svg.createSVGPoint()
      pt.x=x; pt.y=y;
      pt = pt.matrixTransform(xform.inverse());
      pt.x = (pt.x - canvas.padX())
      pt.y = (pt.y - canvas.padY())
      return pt
    }

  }
  trackTransforms(ctx)

  function randomColor(seed) {
    return Math.floor((Math.abs(Math.sin(seed.hashCode()) * 16777215))).toString(16);
  }

  function redraw() {
    var p1 = ctx.transformedPoint(0,0);
    var p2 = ctx.transformedPoint(canvas.width,canvas.height);
    ctx.fillStyle = '#21252b'
    ctx.fillRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);

    const padX = canvas.padX()
    const padY = canvas.padY()

    /*
    const maxX = canvas.width - padX
    const maxY = canvas.height - padY
    const lineWidth = 10
    const linePadding = resSize * lineWidth / resSize / 2

    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(padX - linePadding, padY - linePadding)
    ctx.lineTo(padX - linePadding, maxY + linePadding*2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(padX - linePadding*2, padY - linePadding)
    ctx.lineTo(maxX + linePadding, padY - linePadding)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(maxX + linePadding, maxY + linePadding*2)
    ctx.lineTo(maxX + linePadding, padY - linePadding*2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(padX - linePadding, maxY + linePadding)
    ctx.lineTo(maxX + linePadding, maxY + linePadding)
    ctx.stroke()
    */

    for(let y = 0; y < numY; y++) {
      for(let x = 0; x < numX; x++) {
        const n = numX*y + x
        ctx.beginPath();
        ctx.rect(x * resSize + padX, y * resSize + padY, resSize + 1, resSize + 1)
        ctx.fillStyle = colors[n].color
        ctx.fill();

        if(tooltip === n) {
          const u = colors[n].user
          if(u == user) continue
          ctx.beginPath();
          ctx.fillStyle = '#' + randomColor(u)
          ctx.rect(x * resSize + padX, y * resSize + padY - resSize*2, resSize*u.length + 1, resSize*2 + 1)
          ctx.fill()
          ctx.font = "8px Arial"
          ctx.fillStyle = "#ffffff"
          ctx.fillText(u, x*resSize+padX+resSize/2, y*resSize+padY-resSize/2)
        }
      }
    }

  }
  window.redrawCanvas = redraw

  var lastX=canvas.width/2, lastY=canvas.height/2;
  var dragStart,dragged;
  canvas.addEventListener('mousedown',function(evt){
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
    dragStart = ctx.paddedPoint(lastX, lastY)
    dragged = false;
  },false);

  canvas.addEventListener('mousemove',function(evt){
    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
    var pt = ctx.paddedPoint(lastX, lastY)
    if (dragStart) {
      const dx = pt.x - dragStart.x
      const dy = pt.y - dragStart.y
      if(dragged || Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        dragged = true;
        ctx.translate(dx, dy);
        redraw();
      }
    } else {
      const x = Math.floor(pt.x / resSize)
      const y = Math.floor(pt.y / resSize)
      const old_tooltip = tooltip
      tooltip = null
      if(x >= 0 && y >= 0 && x < numX && y < numY) {
        const n = numX*y + x
        if(colors[n].user) {
          tooltip = n
        }
      }
      if(old_tooltip !== tooltip) {
        redraw()
      }
    }
  },false);

  canvas.addEventListener('mouseup',function(evt){
    if(!dragged && dragStart) {
      const x = Math.floor(dragStart.x / resSize)
      const y = Math.floor(dragStart.y / resSize)
      if(x >= 0 && y >= 0 && x < numX && y < numY) {
        const n = numX*y + x
        const old = colors[n]
        colors[n] = { color: dotColor, user: user || 'Anonymous' }
        notify(n, dotColor, function() {
          colors[n] = old
          redraw()
        })
        redraw()
      }
    }
    dragStart = null;
  },false);

  var zoom = function(clicks) {
    var pt = ctx.transformedPoint(lastX, lastY)
    var factor = Math.pow(scaleFactor, clicks)
    let adj = totalZoom * factor
    if(adj > maxZoom) return
    if(adj < 1) return
    ctx.translate(pt.x, pt.y)
    totalZoom = adj
    ctx.scale(factor, factor)
    ctx.translate(-pt.x,-pt.y)
    redraw();
  }

  var handleScroll = function(evt){
    var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
    if (delta) zoom(delta);
    return evt.preventDefault() && false;
  };
  canvas.addEventListener('DOMMouseScroll',handleScroll,false);
  canvas.addEventListener('mousewheel',handleScroll,false);
  canvas.addEventListener('wheel',handleScroll,false);

  initCanvas()

}
window.startApp = startApp

////////////////////////////////////////////////

const colorOptions = document.getElementsByClassName('dot-color')
const multi = document.getElementById('multipicker')
const presets = {
  'red': '#ff0000',
  'green': '#008000',
  'blue': '#0000ff',
  'black': '#000000',
  'white': '#ffffff',
}

function setColor(color) {
  for(let i = 0; i < colorOptions.length; i++ ) {
    const c = colorOptions.item(i)
    const c_color = c.classList[1]
    if(c_color == color) {
      c.classList.add('active')
      if(color == 'multi') {
        dotColor = multi.value || '#00ffff'
        c.style.background = multi.value || ''
      } else if(Object.keys(presets).includes(color)) {
        dotColor = presets[color]
      } else {
        dotColor = color
      }
    } else {
      c.classList.remove('active')
    }
  }
}

for(let i = 0; i < colorOptions.length; i++ ) {
  const c = colorOptions.item(i)
  const color = c.classList[c.classList.length - 1]
  c.onclick = function() { setColor(color) }
}

multi.onchange = function() { setColor('multi') }



////////////////////////////////////////////////

function toColor(num) {
  num >>>= 0;
  var b = num & 0xFF,
    g = (num & 0xFF00) >>> 8,
    r = (num & 0xFF0000) >>> 16,
    a = 255; // ( (num & 0xFF000000) >>> 24 ) / 255 ;
  return "rgba(" + [r, g, b, a].join(",") + ")";
}

const error = document.getElementsByClassName('error')[0]
const newuser_modal = document.getElementsByClassName('newuser')[0]

if(!user) {
  const newuser_text = document.getElementById('newuser_text')
  const submit = document.getElementsByClassName('setuser')[0]

  loader.classList.remove('visible')
  error.style.display = 'none';
  app.style.display = 'none';
  newuser_modal.style.display = 'flex';
  newuser_modal.classList.add('visible')

  newuser_text.addEventListener('change', function() {
    newuser_text.classList.remove('shake')
  })

  const setusername = function() {
    const u = newuser_text.value || ''
    if(u.length < 2 ||
      u.length > 20 ||
      !u.match(/^[0-9a-zA-Z]+$/)
    ) {
      newuser_text.classList.add('shake')
    } else {
      localStorage.setItem('user', u)
      user = u

      newuser_modal.classList.remove('visible')
      newuser_modal.style.display = 'none'
      app.style.display = null
      app.classList.add('visible')
      startApp(onDot)
    }
  }

  submit.onclick = setusername
  newuser_text.addEventListener('keyup', function(e) {
    if(e.key === 'Enter') { setusername() }
  })
} else {
  newuser_modal.style.display = 'none';
}


///////////////////////////////////////////////


let channel = socket.channel("room:lobby", {})

channel.on('dots', payload => {
})

channel.on('dot', payload => {
  colors[payload.id] = { color: payload.color, user: payload.user }
  window.redrawCanvas()
})

const onDot = function(n, color, onError) {
  channel
    .push('new_dot', {pos: n, color: color, user: user})
    .receive('error', (e) => {
      console.log(`Error: ${e}`)
      onError()
  })
}

error.style.display = 'none'
channel.join()
  .receive("ok", resp => {
    console.log('Joined successfully')
    const dots = resp.dots
    const len = dots.length
    for(let i = 0; i < len; i++) {
      const d = dots[i]
      colors[d.pos] = { color: d.color, user: d.user, updated: d.updated_at }
    }
    if(user) {
      startApp(onDot)
    }
  })
  .receive("error", resp => {
    console.log("Unable to join", resp)
    loader.classList.remove('visible')
    app.style.display = 'none'
    newuser_modal.style.display = 'none'
    error.style.display = 'flex'
    error.classList.add('visible')
  })
