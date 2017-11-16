/*
 * The MIT License
 *
 * Copyright 2017 Jean Carlo de Elias Moreira.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 *==============================================================================
 *
 * NFASimulator
 * Javascript Object
 *
 * @author     Jean Carlo de Elias Moreira | https://www.jeancarloem.com
 * @license    MIT | https://opensource.org/licenses/MIT
 * @copyright  © 2017 Jean Carlo EM
 * @link       https://opensource.jeancarloem.com/NFASimulator/
 */

(function (w, $, xlog) {
  w.lfadrw = function (canvas, q, qdiametro, ativos) {
    this.d = {
      ctx: null,
      canvas: null,
      q: null,
      sizes: null,
      dts:null,
      c: {
        "bk": "#333333",
        "borda": "#3778db",
        "bola": "#none",
        'bolativa': '#none',
        'bordativa': '#ff9900',
        "setas": "#aaa",
        "setativa":'#9966ff'
      }
    };

    this.mt = {
      cos: function (angle) {
        return Math.cos(angle / 180 * Math.PI);
      },

      sin: function (angle) {
        return Math.sin(angle / 180 * Math.PI);
      },

      tan: function (angle) {
        return Math.tan(angle / 180 * Math.PI);
      },

      radianToAngle: function (radian) {
        return radian * (180 / Math.PI);
      },

      angleToRadians: function (angle) {
        return angle * (Math.PI / 180);
      },

      cosToAngle: function (cos) {
        return this.radianToAngle(Math.acos(cos));
      },

      sinToAngle: function (sin) {
        return this.radianToAngle(Math.asin(sin));
      },

      tanToAngle: function (tan) {
        return this.radianToAngle(Math.atan(tan));
      },

      sinToCos: function (sin) {
        return cos(sinToAngle(sin));
      },

      sinToTan: function (sin) {
        return tan(sinToAngle(sin));
      },

      cosToSin: function (cos) {
        return sin(cosToAngle(cos));
      },

      cosToTan: function (cos) {
        return tan(cosToAngle(cos));
      },

      tanToSin: function (tan) {
        return sin(tanToAngle(tan));
      },

      tanToCos: function (tan) {
        return cos(tanToAngle(tan));
      },

      // returns radians
      findAngle: function (sx, sy, ex, ey) {
        return Math.atan2((ey - sy), (ex - sx));
      }
    };

    this.isCanvas = function (canvas) {
      try {
        return ((canvas) && (($(canvas).prop('tagName')).toUpperCase() === 'CANVAS'));
      } catch (err) {
        return false;
      }
    };

    this.canvasInit = function (canvas) {
      if (this.isCanvas(canvas)) {
        this.d.canvas = $(canvas);
        this.d.ctx = this.d.canvas.get(0).getContext('2d');

        this.d.ctx.globalCompositeOperation = "source-over";
        this.d.ctx.imageSmoothingEnabled = true;
      }
    };

    this.calcSizes = function (q, d) {
      this.d.s = {};

      /* DIAMETRO DAS BOLINHAS (ESTADOS) */
      this.d.s.d = d;

      /* RAIOS DAS BOLINHAS (ESTADOS) */
      this.d.s.r = d / 2;

      /* DIAMETRO DA BOLINHA COM MARGEM  */
      this.d.s.b = d * ((q.destinos.length < 6) ? ((4 * 3) / q.destinos.length) : 2);

      /* RADIO DA BOLINHA COM MARGEM  */
      this.d.s.br = this.d.s.b / 2;

      this.d.s.angs = 360 / q.destinos.length;

      /* RAIO GLOBAL */
      this.d.s.R = this.d.s.br / this.mt.sin(this.d.s.angs / 2);

      /* DISTANCIA ENTRE O NUCLEO DO CIRCULO GLOBAL E O NUCLEO DA BOLINHA/ESTADO */
      this.d.s.n = this.d.s.br / this.mt.tan(this.d.s.angs / 2);

      /* DIAMETRO GLOBAL */
      this.d.s.D = this.d.s.R * 2;

      this.d.s.w = this.d.s.h = this.d.s.n * 2 + this.d.s.r + this.d.s.d * 2;

      this.d.s.x = this.d.s.w / 2;
      this.d.s.y = this.d.s.h / 2;

      this.d.s.q = [];
      for (var i = 0; i < q.destinos.length; i++) {
        var ang = i * this.d.s.angs;

        if (ang === 0) {
          this.d.s.q.push({
            x: (this.d.s.x - this.d.s.n),
            y: this.d.s.y,
            quadrante: 0
          });
        } else if (ang === 90) {
          this.d.s.q.push({
            x: this.d.s.x,
            y: this.d.s.y - this.d.s.n,
            quadrante: 1
          });
        } else if (ang === 180) {
          this.d.s.q.push({
            x: (this.d.s.x + this.d.s.n),
            y: this.d.s.y,
            quadrante: 2
          });
        } else if (ang === 270) {
          this.d.s.q.push({
            x: this.d.s.x,
            y: this.d.s.y + this.d.s.n,
            quadrante: 3
          });
        } else if ((ang > 0) && (ang < 90)) {
          this.d.s.q.push({
            x: this.d.s.x - (this.d.s.n * this.mt.cos(ang)),
            y: this.d.s.y - (this.d.s.n * this.mt.sin(ang)),
            quadrante: 0
          });
        } else if ((ang > 90) && (ang < 180)) {
          this.d.s.q.push({
            x: this.d.s.x + (this.d.s.n * this.mt.cos(180 - ang)),
            y: this.d.s.y - (this.d.s.n * this.mt.sin(180 - ang)),
            quadrante: 1
          });
        } else if ((ang > 180) && (ang < 270)) {
          this.d.s.q.push({
            x: this.d.s.x + (this.d.s.n * this.mt.cos(ang - 180)),
            y: this.d.s.y + (this.d.s.n * this.mt.sin(ang - 180)),
            quadrante: 2
          });
        } else if ((ang > 270) && (ang < 360)) {
          this.d.s.q.push({
            x: this.d.s.x - (this.d.s.n * this.mt.cos(360 - ang)),
            y: this.d.s.y + (this.d.s.n * this.mt.sin(360 - ang)),
            quadrante: 3
          });
        }

        this.d.s.q[this.d.s.q.length-1].ang = ang;
      }
    };

    this.calcBordaPoints = function (from, to, margin){
      margin = (margin===true||margin===false)?margin:false;
      minf = (((this.d.s.q[from].quadrante === 3)||(this.d.s.q[from].quadrante === 2)) && to === "c");
      mto   = (((this.d.s.q[from].quadrante === 1)||(this.d.s.q[from].quadrante === 0)) && to === "c");

      /* ANGULO DO DIAMETRO DO CIRCULO DO RIO DIVIDE-SE INTANG POR 2 */
      var intang = this.d.s.angs / 2;

      var sup = {
        y: this.mt.sin(this.d.s.q[from].to[to].ang + intang) * (this.d.s.r*(margin||mto?1.25:1)),
        x: this.mt.cos(this.d.s.q[from].to[to].ang + intang) * (this.d.s.r*(margin||mto?1.25:1))
      };

      if (this.d.s.q[to].y < this.d.s.q[from].y){
        sup.y = this.d.s.q[from].y - sup.y;
      }else{
        sup.y = this.d.s.q[from].y + sup.y;
      }

      if (this.d.s.q[to].x < this.d.s.q[from].x){
        sup.x = this.d.s.q[from].x - sup.x;
      }else{
        sup.x = this.d.s.q[from].x + sup.x;
      }

     var inf = {
        y: this.mt.sin(this.d.s.q[from].to[to].ang - intang/2) * (this.d.s.r*(margin||minf?1.25:1)),
        x: this.mt.cos(this.d.s.q[from].to[to].ang - intang/2) * (this.d.s.r*(margin||minf?1.25:1))
      };

      if (this.d.s.q[to].y < this.d.s.q[from].y){
        inf.y = this.d.s.q[from].y - inf.y;
      }else{
        inf.y = this.d.s.q[from].y + inf.y;
      }

      if (this.d.s.q[to].x < this.d.s.q[from].x){
        inf.x = this.d.s.q[from].x - inf.x;
      }else{
        inf.x = this.d.s.q[from].x + inf.x;
      }

      if ((this.d.s.q[from].quadrante === 3)||(this.d.s.q[from].quadrante === 2)){
        return {
          "sup":sup,
          "inf":inf
        };
      }else{
        return {
          "sup":inf,
          "inf":sup
        };
      }
    };

    this.calcAbertura = function(from, to){

      if ((typeof this.d.s === "object") && (Array.isArray(this.d.s.q)) && (this.d.s.q.length >= from) && (this.d.s.q.length >= to)){
        if (from === to){
          to = "c";

          var center = {
            x: this.d.s.w/2,
            y: this.d.s.h/2
          };

          this.d.s.q[to] = {
            x: center.x + ((2*Math.abs(center.x-this.d.s.q[from].x)) * ((this.d.s.q[from].x>center.x)?1:-1)),
            y: center.y + ((2*Math.abs(center.y-this.d.s.q[from].y)) * ((this.d.s.q[from].y>center.y)?1:-1))
          };
        }

        if ((this.d.s.q[from].hasOwnProperty('to')) && (Array.isArray(this.d.s.q[from])) && (this.d.s.q[from][to] !== undefined)){
          return this.d.s.q[from][to];
        }else{
          var ang = null;

          if (this.d.s.q[from].x === this.d.s.q[to].x){
            ang = 90;
          }else if(this.d.s.q[from].y === this.d.s.q[to].y){
            ang = 0;
          }else{
            var xp = Math.abs(this.d.s.q[from].x - this.d.s.q[to].x);
            var yp = Math.abs(this.d.s.q[from].y - this.d.s.q[to].y);

            var ang = this.mt.tanToAngle(yp/xp);
          }

          if (ang !== null){
            /* FROM - DESTINOS CPOLATERAIS
             *
             */
            if ((!this.d.s.q[from].hasOwnProperty('to')) || (Array.isArray(this.d.s.q[from]))){
              this.d.s.q[from].to = [];
            }

            if (!(to in this.d.s.q[from].to)){
              this.d.s.q[from].to[to] = {'ang':ang};

              /* IDENTIFICA O SENTIDO COLATERAL DO
               * DESTINO (TO) RELAÇÃO A ORIGEM (FROM)
               */
              this.d.s.q[from].to[to].destcolat =
                /* NOROESTE */
                 ((this.d.s.q[to].y < this.d.s.q[from].y) && (this.d.s.q[to].x < this.d.s.q[from].x))
                ? 0
                /* NORDESTE */
                : ((this.d.s.q[to].y < this.d.s.q[from].y) && (this.d.s.q[to].x > this.d.s.q[from].x))
                ? 1
                /* SUDESTE */
                : ((this.d.s.q[to].y > this.d.s.q[from].y) && (this.d.s.q[to].x > this.d.s.q[from].x))
                ? 2
                /* SUDOESTE */
                : ((this.d.s.q[to].y > this.d.s.q[from].y) && (this.d.s.q[to].x < this.d.s.q[from].x))
                ? 3

                /* OESTE */
                : ((this.d.s.q[to].y === this.d.s.q[from].y) && (this.d.s.q[to].x < this.d.s.q[from].x))
                ? -1
                /* LESTE */
                : ((this.d.s.q[to].y === this.d.s.q[from].y) && (this.d.s.q[to].x > this.d.s.q[from].x))
                ? -2
                /* NORTE */
                : ((this.d.s.q[to].y < this.d.s.q[from].y) && (this.d.s.q[to].x === this.d.s.q[from].x))
                ? -3
                /* SUL */
                : ((this.d.s.q[to].y > this.d.s.q[from].y) && (this.d.s.q[to].x === this.d.s.q[from].x))
                ? -4
                : null;

              if (this.d.s.q[from].to[to].destcolat == null){
                return -2;
              }
            }

            /* FROM BORDE
             *
             */
            this.d.s.q[from].to[to].pts = this.calcBordaPoints(from, to, false);

            /* TO - DESTINOS COLATERAIS
             *
             */
            if ((!this.d.s.q[to].hasOwnProperty('to')) || (Array.isArray(this.d.s.q[to]))){
              this.d.s.q[to].to = [];
            }

            if (!(from in this.d.s.q[to].to)){
              this.d.s.q[to].to[from] = {'ang':ang};

              /* CALCULANDO O RETORNO TO -> FROM */
              this.d.s.q[to].to[from].destcolat =
                  this.d.s.q[from].to[to].destcolat === 0
                ? 2
                : this.d.s.q[from].to[to].destcolat === 1
                ? 3
                : this.d.s.q[from].to[to].destcolat === 2
                ? 0
                : this.d.s.q[from].to[to].destcolat === 3
                ? 1
                : this.d.s.q[from].to[to].destcolat === -1
                ? -2
                : this.d.s.q[from].to[to].destcolat === -2
                ? -1
                : this.d.s.q[from].to[to].destcolat === -3
                ? -4
                : this.d.s.q[from].to[to].destcolat === -4
                ? -3
                : null;

              if (this.d.s.q[to].to[from].destcolat === null){
                return -3;
              }
            }

            /* TO BORDER
             *
             */
            this.d.s.q[to].to[from].pts = this.calcBordaPoints(to, from, true);

            /*
             * FINAL
             */
            var r = {
              'to': this.d.s.q[to].to[from],
              'from':this.d.s.q[from].to[to]
            };

            delete this.d.s.q["c"];

            return r;
          }
        }
      }

      return null;
    };

    this.draw = {
      colorir: function (ctx, fundo, contorno) {
        function borda(ctx, color) {
          ctx.strokeStyle = color;
          ctx.lineWidth = this.d.s.r * 0.05;
          ctx.stroke();
        }

        function bk(ctx, color) {
          ctx.fillStyle = color;
          ctx.fill();
        }

        if (/(^#[0-9A-F]{6})|(^#[0-9A-F]{3}|rgba\([ \,0-9]+\))$/i.test(fundo)) {
          bk(ctx, fundo);
        }

        if (/(^#[0-9A-F]{6})|(^#[0-9A-F]{3}|rgba\([ \,0-9]+\))$/i.test(contorno)) {
          borda(ctx, contorno);
        }
      },

      circ: function (ctx, x, y, radius, color, border) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);

        (function () {
          this.draw.colorir(ctx, color, border);
        })();

        (function () {
          return this.d.ctx;
        })().closePath();
      },

      arrow: function (from, to, ativo) {
        function drawArrowhead(ctx, locx, locy, angle, sizex, sizey) {
          var hx = sizex / 2;
          var hy = sizey / 2;

          ctx.save();

          ctx.translate((locx), (locy));
          ctx.rotate(angle);
          ctx.translate(-hx, -hy);

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 1 * sizey);
          ctx.lineTo(1 * sizex, 1 * hy);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
        
        function buildSeta(sx, sy, pf, pt, qdiametro, to, ativo){
          (function(){
            this.d.ctx.beginPath();
            this.d.ctx.fillStyle = ativo?this.d.c.setativa:this.d.c.setas;
            this.d.ctx.moveTo(pf.x, pf.y);
            this.d.ctx.quadraticCurveTo(sx, sy, pt.x, pt.y);
            this.d.ctx.strokeStyle = ativo?this.d.c.setativa:this.d.c.setas;
            this.d.ctx.stroke();
            this.d.ctx.closePath();
            
            var ang = this.mt.findAngle(sx, sy, this.d.s.q[to].x, this.d.s.q[to].y);

            drawArrowhead(this.d.ctx, pt.x, pt.y, ang, this.d.s.r*.25, this.d.s.r*.25);            
            
            if (ativo){
              this.d.ctx.beginPath();
              this.d.ctx.font = this.d.s.r*.5 + "px Arial";
              this.d.ctx.fillStyle = this.d.c.setativa;
              this.d.ctx.textAlign = "left";
              this.d.ctx.fillText(this.d.dts.trans[from][to],sx+5,sy+5);
              this.d.ctx.closePath();
            }            
          })();
        }        

        (function () {
          var pts = this.calcAbertura(from, to);

          var fromquad  = this.d.s.q[from].quadrante,
              toquad    = this.d.s.q[to].quadrante,

              tox   = this.d.s.q[to].x,
              toy   = this.d.s.q[to].y,
              fromx = this.d.s.q[from].x,
              fromy = this.d.s.q[from].y;

          var pf = pt = null, sx = 0, sy = 0;

          if (from === to) {
            pf = pts.from.pts.sup;
            pt = pts.from.pts.inf;

            sx = (((fromquad === 0) || (fromquad === 3)) ? -this.d.s.d : this.d.s.d);
            sy = (((fromquad === 0) || (fromquad === 1)) ? -this.d.s.d : this.d.s.d);
          } else {
            if (((Math.abs(to-from))<=1) || (
              (
                (this.d.s.q[to].x >= (this.d.s.q[from].x-this.d.s.r/2)) &&
                (this.d.s.q[to].x <= (this.d.s.q[from].x+this.d.s.r/2))
              ) ||
              (
                (this.d.s.q[to].y >= (this.d.s.q[from].y-this.d.s.r/2)) &&
                (this.d.s.q[to].y <= (this.d.s.q[from].y+this.d.s.r/2))
              )
            )){
              if (to > from){
                pf = pts.from.pts.sup;
                pt = pts.to.pts.inf;
              }else{
                pf = pts.from.pts.sup;
                pt = pts.to.pts.inf;
              }
            }else{
              /* QUADRANTE 0 */
              if (fromquad === 0){
                pf = pts.from.pts.inf;
                pt = pts.to.pts.inf;

                if ((toquad <= 1)){
                  sy += this.d.s.r;
                  sx += this.d.s.r;

                  if (to < from){
                    sy += this.d.s.d*.7;
                    sx += this.d.s.d*.7;
                  }
                }else if ((toquad > 1)){
                  sy -= this.d.s.r;
                  sx -= this.d.s.r;

                  if (to < from){
                    sy -= this.d.s.d*.7;
                    sx -= this.d.s.d*.7;
                  }
                }
              }

              /* QUADRANTE 1 */
              if (fromquad === 1){
                pf = pts.from.pts.inf;
                pt = pts.to.pts.inf;

                if ((toquad === 0) || (toquad === 3)){
                  sy += this.d.s.r;
                  sx += this.d.s.r;

                  if (to < from){
                    sy += this.d.s.d*.7;
                    sx += this.d.s.d*.7;
                  }
                }else {
                  sy -= this.d.s.r;
                  sx -= this.d.s.r;

                  if (to < from){
                    sy -= this.d.s.d*.7;
                    sx -= this.d.s.d*.7;
                  }
                }
              }

              /* QUADRANTE 2 */
              if (fromquad === 2){
                pf = pts.from.pts.inf;
                pt = pts.to.pts.inf;

                if ((toquad === 2) || (toquad === 3)){
                  sy -= this.d.s.r;
                  sx -= this.d.s.r;

                  if (to < from){
                    sy -= this.d.s.d*.7;
                    sx -= this.d.s.d*.7;
                  }
                }else {
                  sy -= this.d.s.r;
                  sx -= this.d.s.r;

                  if (to < from){
                    sy -= this.d.s.d*.7;
                    sx -= this.d.s.d*.7;
                  }
                }
              }

              /* QUADRANTE 3 */
              if (fromquad === 3){
                pf = pts.from.pts.inf;
                pt = pts.to.pts.inf;

                if ((toquad === 0) || (toquad === 3)){
                  sy -= this.d.s.r;
                  sx += this.d.s.r;

                  if (to < from){
                    sy -= this.d.s.d*.7;
                    sx += this.d.s.d*.7;
                  }
                }else {
                  sy -= this.d.s.r;
                  sx -= this.d.s.r;

                  if (to < from){
                    sy -= this.d.s.d*.7;
                    sx -= this.d.s.d*.7;
                  }
                }
              }
            }
          }

          sx += ((pt.x < pf.x) ? pt.x : pf.x) + (Math.abs(pt.x - pf.x) / 2),
          sy += ((pt.y < pf.y) ? pt.y : pf.y) + (Math.abs(pt.y - pf.y) / 2);

          buildSeta(sx, sy, pf, pt, qdiametro, to, ativo);
          
          if (from === 0){             
            //this.draw.circ(this.d.ctx, this.d.s.q[from].x-(this.d.s.r*1.2), this.d.s.h/2, this.d.s.r, "#ff0000");
            
            buildSeta(0, this.d.s.h/2, {
              x:0,
              y:this.d.s.h/2
            },{
              x:this.d.s.q[from].x-(this.d.s.r*1.25),
              y:this.d.s.h/2              
            }, qdiametro, 0, false);                        
          }
        })();
      },

      q: function (x, y, final, ativo) {
        final = ((final === true) || (final === false)) ? final : false;
        ativo = ((ativo === true) || (ativo === false)) ? ativo : false;

        (function () {
          this.draw.circ(this.d.ctx, x, y, this.d.s.r, ativo?this.d.c.bolativa:this.d.c.bola, ativo?this.d.c.bordativa:this.d.c.borda);

          if (final) {
            this.draw.circ(this.d.ctx, x, y, this.d.s.r * 0.8, ativo?this.d.c.bolativa:this.d.c.bola, ativo?this.d.c.bordativa:this.d.c.borda);
          }
        })();
      }
    };


    this.init = function (canvas, q, qdiametro, ativos) {
      if ((this.isCanvas(canvas)) && (Array.isArray(q.destinos)) && (q.destinos.length > 0) && (qdiametro > 1)) {
        this.canvasInit(canvas);

        this.d.dts = q;

        /* CALCULAS AS DIMENSOES CARTESIANAS */
        this.calcSizes(q, qdiametro);

        // DEFINE O TAMANHO
        this.d.canvas.attr('width', this.d.s.w);
        this.d.canvas.attr('height', this.d.s.h);

        this.d.canvas.width = this.d.canvas.attr('width');
        this.d.canvas.height = this.d.canvas.attr('height');
        
        for (var i = 0; i < q.destinos.length; i++) {
          for (var g = 0; g < q.destinos[i].length; g++) {
            var d = Array.isArray(q.destinos[i][g]) ? q.destinos[i][g] : [q.destinos[i][g]];

            for (var dest = 0; dest < d.length; dest++)
              if ((typeof d[dest] === "number") && (d[dest] >= 0)) {
                var ativo = (Array.isArray(ativos) && ativos.indexOf(i)>=0) || ((!Array.isArray(ativos))&&(i===0));
                this.draw.arrow(i, d[dest], ativo);
              }
          }
        }

        this.d.ctx.font = (qdiametro*.25) + "px Arial";

        for (var i = 0; i < this.d.s.q.length; i++) {
          this.draw.q(this.d.s.q[i].x, this.d.s.q[i].y, (q.finais.indexOf(i) >= 0), Array.isArray(ativos)?ativos.indexOf(i)>=0:(!Array.isArray(ativos))&&(i===0));
          this.d.ctx.fillStyle = this.d.c.setas;
          this.d.ctx.textAlign = "center";
          this.d.ctx.fillText("q"+i,this.d.s.q[i].x,this.d.s.q[i].y+(qdiametro*.25)/3);
        }

        return true;
      }

      return false;
    };

    this.init(canvas, q, qdiametro, ativos);
  };
})(window, (typeof jQuery === "object" ? jQuery : Zepto), function (t) {
  console.log(t);
});