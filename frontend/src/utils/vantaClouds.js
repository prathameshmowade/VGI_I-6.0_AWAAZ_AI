import * as THREE from 'three';

// Initialize window.THREE so VantaBase can seamlessly bind
if (typeof window !== 'undefined') {
  window.THREE = THREE;
}

// Self-contained Vanta CLOUDS 3D Raymarching Engine
const vantaCloudsFactory = (function () {
  const n = typeof window === 'object';
  let o = (n && window.THREE) || THREE;
  if (n && !window.VANTA) window.VANTA = {};
  const s = (n && window.VANTA) || {};

  s.register = (name, cls) => {
    s[name] = (opts) => new cls(opts);
    return s[name];
  };

  function disposeThree(e) {
    while (e.children && e.children.length > 0) {
      disposeThree(e.children[0]);
      e.remove(e.children[0]);
    }
    if (e.geometry) e.geometry.dispose();
    if (e.material) {
      Object.keys(e.material).forEach((t) => {
        if (e.material[t] && typeof e.material[t].dispose === 'function') {
          e.material[t].dispose();
        }
      });
      if (typeof e.material.dispose === 'function') e.material.dispose();
    }
  }

  s.VantaBase = class {
    constructor(e = {}) {
      if (!n) return;
      s.current = this;
      this.windowMouseMoveWrapper = this.windowMouseMoveWrapper.bind(this);
      this.windowTouchWrapper = this.windowTouchWrapper.bind(this);
      this.windowGyroWrapper = this.windowGyroWrapper.bind(this);
      this.resize = this.resize.bind(this);
      this.animationLoop = this.animationLoop.bind(this);
      this.restart = this.restart.bind(this);

      const defs = typeof this.getDefaultOptions === 'function' ? this.getDefaultOptions() : this.defaultOptions;
      this.options = Object.assign(
        {
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1
        },
        defs
      );

      if (e instanceof HTMLElement || typeof e === 'string') e = { el: e };
      Object.assign(this.options, e);

      if (this.options.THREE) o = this.options.THREE;
      this.el = this.options.el;

      if (!this.el) {
        console.error('[VANTA] Instance needs "el" param!');
        return;
      }
      if (!(this.options.el instanceof HTMLElement)) {
        this.el = document.querySelector(this.el);
        if (!this.el) {
          console.error('[VANTA] Cannot find element', e);
          return;
        }
      }

      this.prepareEl();
      this.initThree();
      this.setSize();

      try {
        this.init();
      } catch (err) {
        console.error('[VANTA] Init error', err);
        if (this.renderer && this.renderer.domElement) {
          this.el.removeChild(this.renderer.domElement);
        }
        return;
      }

      this.initMouse();
      this.resize();
      this.animationLoop();

      window.addEventListener('resize', this.resize);
      window.requestAnimationFrame(this.resize);

      if (this.options.mouseControls) {
        window.addEventListener('scroll', this.windowMouseMoveWrapper);
        window.addEventListener('mousemove', this.windowMouseMoveWrapper);
      }
      if (this.options.touchControls) {
        window.addEventListener('touchstart', this.windowTouchWrapper);
        window.addEventListener('touchmove', this.windowTouchWrapper);
      }
      if (this.options.gyroControls) {
        window.addEventListener('deviceorientation', this.windowGyroWrapper);
      }
    }

    setOptions(e = {}) {
      Object.assign(this.options, e);
      this.triggerMouseMove();
    }

    prepareEl() {
      for (let i = 0; i < this.el.children.length; i++) {
        const c = this.el.children[i];
        if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
        if (getComputedStyle(c).zIndex === 'auto') c.style.zIndex = 1;
      }
      if (getComputedStyle(this.el).position === 'static') {
        this.el.style.position = 'relative';
      }
    }

    applyCanvasStyles(e, t = {}) {
      Object.assign(e.style, {
        position: 'absolute',
        zIndex: 0,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: ''
      });
      Object.assign(e.style, t);
      e.classList.add('vanta-canvas');
    }

    initThree() {
      if (o.WebGLRenderer) {
        this.renderer = new o.WebGLRenderer({ alpha: true, antialias: true });
        this.el.appendChild(this.renderer.domElement);
        this.applyCanvasStyles(this.renderer.domElement);
        if (isNaN(this.options.backgroundAlpha)) this.options.backgroundAlpha = 1;
        this.scene = new o.Scene();
      }
    }

    getCanvasElement() {
      return this.renderer ? this.renderer.domElement : undefined;
    }

    getCanvasRect() {
      const e = this.getCanvasElement();
      return e ? e.getBoundingClientRect() : null;
    }

    windowMouseMoveWrapper(e) {
      const t = this.getCanvasRect();
      if (!t) return false;
      const i = e.clientX - t.left;
      const n = e.clientY - t.top;
      if (i >= 0 && n >= 0 && i <= t.width && n <= t.height) {
        this.mouseX = i;
        this.mouseY = n;
        if (!this.options.mouseEase) this.triggerMouseMove(i, n);
      }
    }

    windowTouchWrapper(e) {
      const t = this.getCanvasRect();
      if (!t) return false;
      if (e.touches && e.touches.length === 1) {
        const i = e.touches[0].clientX - t.left;
        const n = e.touches[0].clientY - t.top;
        if (i >= 0 && n >= 0 && i <= t.width && n <= t.height) {
          this.mouseX = i;
          this.mouseY = n;
          if (!this.options.mouseEase) this.triggerMouseMove(i, n);
        }
      }
    }

    windowGyroWrapper(e) {
      const t = this.getCanvasRect();
      if (!t) return false;
      const i = Math.round(2 * e.alpha) - t.left;
      const n = Math.round(2 * e.beta) - t.top;
      if (i >= 0 && n >= 0 && i <= t.width && n <= t.height) {
        this.mouseX = i;
        this.mouseY = n;
        if (!this.options.mouseEase) this.triggerMouseMove(i, n);
      }
    }

    triggerMouseMove(e, t) {
      if (e === undefined && t === undefined) {
        if (this.options.mouseEase) {
          e = this.mouseEaseX;
          t = this.mouseEaseY;
        } else {
          e = this.mouseX;
          t = this.mouseY;
        }
      }
      if (this.uniforms && this.uniforms.iMouse) {
        this.uniforms.iMouse.value.x = e / this.scale;
        this.uniforms.iMouse.value.y = t / this.scale;
      }
      const i = e / this.width;
      const n = t / this.height;
      if (typeof this.onMouseMove === 'function') this.onMouseMove(i, n);
    }

    setSize() {
      if (!this.scale) this.scale = 1;
      if (
        typeof navigator !== 'undefined' &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) &&
        this.options.scaleMobile
      ) {
        this.scale = this.options.scaleMobile;
      } else if (this.options.scale) {
        this.scale = this.options.scale;
      }
      this.width = Math.max(this.el.offsetWidth || window.innerWidth, this.options.minWidth);
      this.height = Math.max(this.el.offsetHeight || window.innerHeight, this.options.minHeight);
    }

    initMouse() {
      if (!this.mouseX && !this.mouseY) {
        this.mouseX = this.width / 2;
        this.mouseY = this.height / 2;
        this.triggerMouseMove(this.mouseX, this.mouseY);
      }
    }

    resize() {
      this.setSize();
      if (this.camera) {
        this.camera.aspect = this.width / this.height;
        if (typeof this.camera.updateProjectionMatrix === 'function') {
          this.camera.updateProjectionMatrix();
        }
      }
      if (this.renderer) {
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio / this.scale);
      }
      if (typeof this.onResize === 'function') this.onResize();
    }

    isOnScreen() {
      return true; // Keep active for full page background
    }

    animationLoop() {
      if (!this.t) this.t = 0;
      if (!this.t2) this.t2 = 0;
      const e = performance.now();
      if (this.prevNow) {
        let t = (e - this.prevNow) / (1000 / 60);
        t = Math.max(0.2, Math.min(t, 5));
        this.t += t;
        this.t2 += (this.options.speed || 1) * t;
        if (this.uniforms && this.uniforms.iTime) {
          this.uniforms.iTime.value = 0.016667 * this.t2;
        }
      }
      this.prevNow = e;

      if (this.options.mouseEase) {
        this.mouseEaseX = this.mouseEaseX || this.mouseX || 0;
        this.mouseEaseY = this.mouseEaseY || this.mouseY || 0;
        if (Math.abs(this.mouseEaseX - this.mouseX) + Math.abs(this.mouseEaseY - this.mouseY) > 0.1) {
          this.mouseEaseX += 0.05 * (this.mouseX - this.mouseEaseX);
          this.mouseEaseY += 0.05 * (this.mouseY - this.mouseEaseY);
          this.triggerMouseMove(this.mouseEaseX, this.mouseEaseY);
        }
      }

      if (this.isOnScreen() || this.options.forceAnimate) {
        if (typeof this.onUpdate === 'function') this.onUpdate();
        if (this.scene && this.camera && this.renderer) {
          this.renderer.render(this.scene, this.camera);
          this.renderer.setClearColor(this.options.backgroundColor || 0xffffff, this.options.backgroundAlpha || 1);
        }
      }

      this.req = window.requestAnimationFrame(this.animationLoop);
    }

    restart() {
      if (this.scene) {
        while (this.scene.children.length) {
          this.scene.remove(this.scene.children[0]);
        }
      }
      if (typeof this.onRestart === 'function') this.onRestart();
      this.init();
    }

    init() {
      if (typeof this.onInit === 'function') this.onInit();
    }

    destroy() {
      if (typeof this.onDestroy === 'function') this.onDestroy();
      window.removeEventListener('touchstart', this.windowTouchWrapper);
      window.removeEventListener('touchmove', this.windowTouchWrapper);
      window.removeEventListener('scroll', this.windowMouseMoveWrapper);
      window.removeEventListener('mousemove', this.windowMouseMoveWrapper);
      window.removeEventListener('deviceorientation', this.windowGyroWrapper);
      window.removeEventListener('resize', this.resize);
      window.cancelAnimationFrame(this.req);

      if (this.scene) disposeThree(this.scene);
      if (this.renderer) {
        if (this.renderer.domElement && this.renderer.domElement.parentElement) {
          this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
        this.renderer.dispose();
        this.renderer = null;
        this.scene = null;
      }
      if (s.current === this) s.current = null;
    }
  };

  class ShaderBase extends s.VantaBase {
    constructor(e) {
      if (e.THREE) o = e.THREE;
      o.Color.prototype.toVector = function () {
        return new o.Vector3(this.r, this.g, this.b);
      };
      super(e);
      this.updateUniforms = this.updateUniforms.bind(this);
    }

    init() {
      this.mode = 'shader';
      this.uniforms = {
        iTime: { type: 'f', value: 1 },
        iResolution: { type: 'v2', value: new o.Vector2(1, 1) },
        iDpr: { type: 'f', value: window.devicePixelRatio || 1 },
        iMouse: { type: 'v2', value: new o.Vector2(this.mouseX || 0, this.mouseY || 0) }
      };
      super.init();
      if (this.fragmentShader) this.initBasicShader();
    }

    setOptions(e) {
      super.setOptions(e);
      this.updateUniforms();
    }

    initBasicShader(e = this.fragmentShader, t = this.vertexShader) {
      if (!t) {
        t = `uniform float uTime;
uniform vec2 uResolution;
void main() {
  gl_Position = vec4( position, 1.0 );
}`;
      }
      this.updateUniforms();
      const i = new o.ShaderMaterial({ uniforms: this.uniforms, vertexShader: t, fragmentShader: e });
      const plane = new o.Mesh(new o.PlaneGeometry(2, 2), i);
      this.scene.add(plane);
      this.camera = new o.Camera();
      this.camera.position.z = 1;
    }

    updateUniforms() {
      const e = {};
      for (const t in this.options) {
        const val = this.options[t];
        if (t.toLowerCase().indexOf('color') !== -1) {
          e[t] = { type: 'v3', value: new o.Color(val).toVector() };
        } else if (typeof val === 'number') {
          e[t] = { type: 'f', value: val };
        }
      }
      return Object.assign(this.uniforms, e);
    }

    resize() {
      super.resize();
      if (this.uniforms && this.uniforms.iResolution) {
        this.uniforms.iResolution.value.x = this.width / this.scale;
        this.uniforms.iResolution.value.y = this.height / this.scale;
      }
    }
  }

  class VantaClouds extends ShaderBase {}

  VantaClouds.prototype.defaultOptions = {
    backgroundColor: 0xf8fafc,
    skyColor: 0x688bfb,
    cloudColor: 0xadc1ee,
    cloudShadowColor: 0x183550,
    sunColor: 0xff9900,
    sunGlareColor: 0xff6600,
    sunlightColor: 0xff9900,
    scale: 3,
    scaleMobile: 12,
    speed: 1,
    mouseEase: true
  };

  VantaClouds.prototype.fragmentShader = `uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float iTime;
uniform sampler2D iTex;

uniform float speed;
uniform vec3 skyColor;
uniform vec3 cloudColor;
uniform vec3 cloudShadowColor;
uniform vec3 sunColor;
uniform vec3 sunlightColor;
uniform vec3 sunGlareColor;
uniform vec3 backgroundColor;

float hash(float p) {
  p = fract(p * 0.011);
  p *= (p + 7.5);
  p *= (p + p);
  return fract(p);
}

float noise( vec3 x ){
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float n = p.x + p.y*57.0 + 113.0*p.z;
    return mix(mix(mix( hash(n+0.0  ), hash(n+1.0  ),f.x),
                   mix( hash(n+57.0 ), hash(n+58.0 ),f.x),f.y),
               mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                   mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
}

const float constantTime = 1000.;
float map5( in vec3 p ){
    vec3 speed1 = vec3(0.5,0.01,1.0) * 0.5 * speed;
    vec3 q = p - speed1*(iTime + constantTime);
    float f;
    f  = 0.50000*noise( q ); q = q*2.02;
    f += 0.25000*noise( q ); q = q*2.03;
    f += 0.12500*noise( q ); q = q*2.01;
    f += 0.06250*noise( q ); q = q*2.02;
    f += 0.03125*noise( q );
    return clamp( 1.5 - p.y - 2.0 + 1.75*f, 0.0, 1.0 );
}
float map4( in vec3 p ){
    vec3 speed1 = vec3(0.5,0.01,1.0) * 0.5 * speed;
    vec3 q = p - speed1*(iTime + constantTime);
    float f;
    f  = 0.50000*noise( q ); q = q*2.02;
    f += 0.25000*noise( q ); q = q*2.03;
    f += 0.12500*noise( q ); q = q*2.01;
    f += 0.06250*noise( q ); q = q*2.02;
    f += 0.03125*noise( q );
    return clamp( 1.5 - p.y - 2.0 + 1.75*f, 0.0, 1.0 );
}
float map3( in vec3 p ){
    vec3 speed1 = vec3(0.5,0.01,1.0) * 0.5 * speed;
    vec3 q = p - speed1*(iTime + constantTime);
    float f;
    f  = 0.50000*noise( q ); q = q*2.02;
    f += 0.25000*noise( q ); q = q*2.03;
    f += 0.12500*noise( q ); q = q*2.01;
    f += 0.06250*noise( q ); q = q*2.02;
    f += 0.03125*noise( q );
    return clamp( 1.5 - p.y - 2.0 + 1.75*f, 0.0, 1.0 );
}
float map2( in vec3 p ){
    vec3 speed1 = vec3(0.5,0.01,1.0) * 0.5 * speed;
    vec3 q = p - speed1*(iTime + constantTime);
    float f;
    f  = 0.50000*noise( q ); q = q*2.02;
    f += 0.25000*noise( q ); q = q*2.03;
    f += 0.12500*noise( q ); q = q*2.01;
    f += 0.06250*noise( q ); q = q*2.02;
    f += 0.03125*noise( q );
    return clamp( 1.5 - p.y - 2.0 + 1.75*f, 0.0, 1.0 );
}

vec3 sundir = normalize( vec3(-1.0,0.0,-1.0) );

vec4 integrate( in vec4 sum, in float dif, in float den, in vec3 bgcol, in float t ){
    vec3 lin = cloudColor*1.4 + sunlightColor*dif;
    vec4 col = vec4( mix( vec3(1.0,0.95,0.8), cloudShadowColor, den ), den );
    col.xyz *= lin;
    col.xyz = mix( col.xyz, bgcol, 1.0-exp(-0.003*t*t) );
    col.a *= 0.4;
    col.rgb *= col.a;
    return sum + col*(1.0-sum.a);
}

#define MARCH(STEPS,MAPLOD) for(int i=0; i<STEPS; i++) { vec3 pos = ro + t*rd; if( pos.y<-3.0 || pos.y>2.0 || sum.a > 0.99 ) break; float den = MAPLOD( pos ); if( den>0.01 ) { float dif = clamp((den - MAPLOD(pos+0.3*sundir))/0.6, 0.0, 1.0 ); sum = integrate( sum, dif, den, bgcol, t ); } t += max(0.075,0.02*t); }

vec4 raymarch( in vec3 ro, in vec3 rd, in vec3 bgcol, in ivec2 px ){
    vec4 sum = vec4(0.0);
    float t = 0.0;
    MARCH(20,map5);
    MARCH(25,map4);
    MARCH(30,map3);
    MARCH(40,map2);
    return clamp( sum, 0.0, 1.0 );
}

mat3 setCamera( in vec3 ro, in vec3 ta, float cr ){
    vec3 cw = normalize(ta-ro);
    vec3 cp = vec3(sin(cr), cos(cr),0.0);
    vec3 cu = normalize( cross(cw,cp) );
    vec3 cv = normalize( cross(cu,cw) );
    return mat3( cu, cv, cw );
}

vec4 render( in vec3 ro, in vec3 rd, in ivec2 px ){
    float sun = clamp( dot(sundir,rd), 0.0, 1.0 );
    vec3 col = skyColor - rd.y*0.2*vec3(1.0,0.5,1.0) + 0.15*0.5;
    col += 0.2*sunColor*pow( sun, 8.0 );
    vec4 res = raymarch( ro, rd, col, px );
    col = col*(1.0-res.w) + res.xyz;
    col += 0.2*sunGlareColor*pow( sun, 3.0 );
    return vec4( col, 1.0 );
}

void main(){
    vec2 p = (-iResolution.xy + 2.0*gl_FragCoord.xy)/ iResolution.y;
    vec2 m = iMouse.xy/iResolution.xy;
    m.y = (1.0 - m.y) * 0.33 + 0.28;
    m.x *= 0.25;
    m.x += sin(iTime * 0.1 + 3.1415) * 0.25 + 0.25;

    vec3 ro = 4.0*normalize(vec3(sin(3.0*m.x), 0.4*m.y, cos(3.0*m.x)));
    vec3 ta = vec3(0.0, -1.0, 0.0);
    mat3 ca = setCamera( ro, ta, 0.0 );
    vec3 rd = ca * normalize( vec3(p.xy,1.5));

    gl_FragColor = render( ro, rd, ivec2(gl_FragCoord-0.5) );
}
`;

  return s.register('CLOUDS', VantaClouds);
})();

export default vantaCloudsFactory;
