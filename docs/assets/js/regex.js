(function (window, $, xlog) {
  Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
      if (obj.hasOwnProperty(key))
        size++;
    }
    return size;
  };

  window.lfaRegex = function () {
    this.dts = {
      /* NUL AQUI SIGNIFICA EPSON */
      abto: null,

      /* NULL AQUI SIGNIFICA QUE NAO VAI PARA DESTINO ALGUM */
      destinos: null,
      start: 0,
      finais: [],
      cols: []
    };

    this.make = function (dts, onAddST, onUpdateST) {
      function iniciaDestinos(dts) {
        var rg = /^(\s*[0-9]+(\s*[,\.\-]\s?[0-9]+)*\s*)?$/;

        for (var i = 0; i < dts.destinos.length; i++) {
          for (var j = 0; j < dts.destinos[i].length; j++) {            
            var d = ("" + dts.destinos[i][j]).replace(/[^0-9,\.\-]/g, '');

            if (!rg.test(d)) {
              throw "[ERRO] O estado q" + i + " possui uma transicao [" + j + "] cujo destino nao é aceito '" + d + "'.";
            }
            
            if (d.length > 0) {
              d = (/^[0-9]$/.test(d)) ? parseInt(d) : JSON.parse("[" + d.replace(/[\.\-]/g, ',') + "]");
            } else {
              d = null;
            }

            dts.destinos[i][j] = d;
          }
        }

        return dts;
      }
      ;

      /*
       * ADICIONA UM ESTADO A UMA COLUNA (ST)
       * APENAS SE ELE JAH NAO TIVER SIDO INCLUIDO
       */
      function addST(dts, st, index, expanded, callback) {
        expanded = ((expanded === false) || (expanded === true)) ? expanded : false;

        /*
         * ADICIONA UM ESTADO (NUMERO) AO PASSO CUJO INDICE EH "INDEX"
         * APENAS SE ELE JAH NAO TIVER SIDO INCLUIDO
         */
        function add(dts, st, index, expanded, callback) {
          if ((st !== null) && (typeof st === "number") && (st >= 0) && (dts.cols[index].indexOf(st) < 0)) {
            dts.cols[index].push(st);

            if (typeof callback === "function") {
              callback(st, (dts.start === st), (dts.finais.indexOf(st) >= 0), expanded, index);
            }
          }

          return dts;
        }
        ;

        if (st !== null) {
          if ((Array.isArray(st)) && (st.length > 0)) {
            for (var i = 0; i < st.length; i++) {
              dts = add(dts, st[i], index, expanded, callback);
            }

          } else {
            dts = add(dts, st, index, expanded, callback);
          }
        }

        return dts;
      }
      ;


      this.processST = function (dts, st, mself) {
        function findStar(dts, st) {
          var trans = [];

          for (var i = 0; dts.destinos[st].length; i++) {
            if (Array.isArray(dts.destinos[st][i])) {
              var p = dts.destinos[st][i].indexof(st);

              if (p >= 0) {
                trans.push(dts.abto[p]);
              }
            } else if (dts.destinos[st][i] === st) {
              trans.push(dts.abto[i]);
            }
          }

          var r = '';

          if (trans.length > 0) {
            if (trans.length === 1) {
              r = trans[0] + "*";
            } else {
              r = "(" + trans.join("+") + ")*";
            }
          }

          return r;
        }
        ;

        /*
         * CRIA UM VETOR, CUJO KEY SAO OS POSSIVEIS DESTINOS
         * E O CONTEUDO SAO OS CARACTERES DE TRANSACAO QUE LEVAM PARA ELE
         *
         * OU SEJA, EH POSSIVEL SABER PARA QUANTOS DESTINOS VAIS, E QUAIS
         * SAO OS DIGITOS QUE LEVAM PARA ELE
         */
        function findDistinctDestination(dts, st, ignoreEpsilon) {
          function addDest(to, tran, dest) {
            if ((typeof to === "object") && (dts.abto.indexOf(tran) >= 0) && (typeof dest === "number") && (dest >= 0) && (dest < dts.destinos.length)) {
              if (to.hasOwnProperty(dest)) {
                to[dest].push(tran);
              } else {
                to[dest] = [tran];
              }
            }

            return to;
          }

          ignoreEpsilon = ((ignoreEpsilon===true)||(ignoreEpsilon===false)) ? ignoreEpsilon : false;
          var epsilonId = dts.abto.indexOf('ε');

          var to = {};

          for (var i = 0; i < dts.destinos[st].length; i++) {
            if ((i !== epsilonId) || (!ignoreEpsilon)) {
              if (Array.isArray(dts.destinos[st][i])) {
                for (var g = 0; g < dts.destinos[st][i].length; g++) {
                  if ((g !== epsilonId) || (!ignoreEpsilon)) {
                    to = addDest(to, dts.abto[i], (g === epsilonId) ? -1 : dts.destinos[st][i][g]);
                  }
                }
              } else {
                to = addDest(to, dts.abto[i], dts.destinos[st][i]);
              }
            }
          }                    

          return to;
        }

        function clone(obj) {
          if (null == obj || "object" != typeof obj)
            return obj;
          var copy = obj.constructor();
          for (var attr in obj) {
            if (obj.hasOwnProperty(attr))
              copy[attr] = obj[attr];
          }
          return copy;
        }

        function rasterize(to) {
          for (var key in to) {
            if (to[key].length === 1) {
              to[key] = to[key][0] + "*";
            } else if (to[key].length > 1) {
              to[key] = "(" + to[key].join("+") + ")";
            }
          }

          return to;
        }

        /*
         * VERIFIFICA SE O ITEM DA PILHA ATUAL (mnself), EH DESCENDENTE DE
         * ALGUM ITEM, CUJO st = dest
         */
        function isPai(dts, dest, mself) {
          var este = {'pself': mself, 'pilhapai': dts.pilha[mself].pilhapai, 'st': dts.pilha[mself].st};

          if (dts.pilha[mself].pilhapai !== null) {
            if (dts.pilha[dts.pilha[mself].pilhapai].st === dest) {
              /* PRIMEIRO ITEM O INDICE DO PAI NA PILHA, O SEGUNDO O ID DO ESTADO Q0, Q1.. */
              return [este];
            } else {
              var ascen = isPai(dts, dest, dts.pilha[mself].pilhapai);

              if (ascen !== false) {
                ascen.push(este);
              }

              return ascen;
            }
          }

          return false;
        }

        mself = ((typeof mself === "number") && (mself >= 0)) ? mself : 0;

        if (!mself) {
          dts.pilha.push({'pilhapai': null, 'st': st, seq: [], 'pself': 0, loops:[]});
        }                

        if ( (!dts.hasOwnProperty("trans")) || ((dts.hasOwnProperty("trans")) && (typeof dts.trans !== "object")) ){          
          dts.trans = [];          
        }
        
        var to = dts.trans[st] = findDistinctDestination(dts, st);        
        var tot = rasterize(clone(to));
        
        
        /*
         * PRIMEIRA ADICIONAMOS O LOOP (ESTRELA)
         */
        if (to.hasOwnProperty(st)) {
          dts.pilha[mself].seq.push(tot[st]);
        }

        for (dest in to) {
          /*
           * AGORA, TEM QUE VER SE EXISTEM MAIS DE DUAS POSSIBILIDADES DE DESTINO
           */
          if (dest !== st) {
            var ascen = isPai(dts, dest, mself);

            if (ascen !== false) {
              dts.pilha[mself].loops.push({});
              dts.pilha[mself].loops[dts.pilha[mself].loops.length-1][dest] = ascen;

            } else {
              var n = dts.pilha.push({'pilhapai': mself, 'st': dest, seq: [], loops:[]}) - 1;
              dts.pilha[n].pself = n;

              dts = this.processST(dts, dest, n);
            }
          }
        }

        return dts;
      };

      /*
       * PERCORRE A COLUNA (PASSO) ATUAL E, PARA CADA STADO QUE HOUVE UMA
       * TRANSICAO EPSON, ADICIONA O ESTADO DESTINO NA COLUNA (PASSO) ATUAL
       */
      function expandEpsilon(dts, st, stepAtual, callback) {
        /* VERIFICA SE EXISTE NO ALFABETO O UPSILON */
        var epsilonIndex = dts.abto.indexOf('ε');

        if (epsilonIndex >= 0) {
          for (var i = 0; i < dts.cols[stepAtual].length; i++) {
            /* UM ESTADO A SER EXPANDIDO */
            var estado = dts.cols[stepAtual][i];

            /* OBTEM O DESTINO DA TRANSICAO UPSILON */
            var destino = dts.destinos[estado][epsilonIndex];

            /* SE HOUVER UM DESTINO VÁLIDO */
            xlog("@ EXPANDINDO EPSILONS: " + destino);
            dts = addST(dts, destino, stepAtual, true, callback);
          }
        }

        return dts;
      }
      ;

      if ((typeof dts === "object") && (dts.hasOwnProperty('abto')) && (dts.hasOwnProperty('destinos')) && (dts.hasOwnProperty('start')) && (dts.hasOwnProperty('finais'))) {
        this.dts = iniciaDestinos(dts);
        this.dts.start = ((""+dts.start).length <= 0) ? 0 : parseInt(dts.start);

        this.dts.cols = [];

        this.dts.rs = [];
        this.dts.pilha = [];

        for (var i = 0; i < this.dts.destinos.length; i++) {
          this.dts.cols.push([]);
          this.dts = addST(this.dts, i, i, false, onAddST);
          this.dts = expandEpsilon(this.dts, i, i, onAddST);
        }

        this.dts = this.processST(this.dts, this.dts.start);        
      }

      return this.dts;
    }
  };
})(window, (typeof jQuery === "object" ? jQuery : Zepto), function (t) {
  /*console.log(t);*/
});