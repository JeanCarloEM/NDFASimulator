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

(function (window, $, xlog) {
  window.lfa = function(){
    this.dts = {
      /* NUL AQUI SIGNIFICA EPSON */
      abto: ["0", "1", null],

      /* NULL AQUI SIGNIFICA QUE NAO VAI PARA DESTINO ALGUM */
      destinos: [
        [0, [0,1], null],
        [2, null, 2],
        [null, 3, null],
        [3, 3, null]
      ],
      start:0,
      finais: [3],
      steps:[[]]
    };

    this.getDT = function(){
      return this.dts;
    };

    this.match = function(dtsOuStr, str, callback){
      /*
       * PERCORRE A COLUNA (PASSO) ATUAL E, PARA CADA STADO QUE HOUVE UMA
       * TRANSICAO EPSON, ADICIONA O ESTADO DESTINO NA COLUNA (PASSO) ATUAL
       */
      function expandEpsilon(dts, callback){
        var epsilonIndex = dts.abto.indexOf(null);

        if (epsilonIndex > 0){
          var stepAtual = dts.steps.length-1;

          for (var i = 0; i < dts.steps[stepAtual].length; i++){            
            var estado = dts.steps[stepAtual][i];

            var destino = dts.destinos[estado][epsilonIndex];

            /* SE HOUVE UM DESTINO VÁLIDO */
            if (destino){
              xlog("@ EXPANDINDO EPSILONS:");              
              dts.steps[stepAtual].push(destino);

              if (typeof callback === "function"){
                callback(null, stepAtual, i, null, destino, 0);
              }
            }
          }
        }

        return dts;
      }

      /*
       * 1. CRIA UMA NOVA COLUNA (PASSO)
       * 2. VARRE A COLUNA (PASSO) ATUAL, PASSANDO POR CADA UM DOS ESTADOS E
       *    PARA CADA "ESTADO" EXISTENTE NA NOVA COLUNA, VERIFICA A TRANCICao
       *    "CHR" E ADICIONA OS ESTADOS DESTINOS NA NOVA COLUNA (PASSO)
       *
       * IGNORA AS TRANSICOES EPSON, JÁ QUE O PROCESSAMENTO DAS MESMAS DEVE SER
       * REALIZADO POR "expandEpsilon"
       */
      function processStep(chr, dts, callback){
        if (chr){
          var chrIndex = dts.abto.indexOf(chr);          

          if (chrIndex >= 0){
            var stepAtual = dts.steps.length-1;
            var newStep = [];
            xlog("PASSO =========== " + stepAtual + " || Digito: " + chr);
            for (var i = 0; i < dts.steps[stepAtual].length; i++){              
              var estado = dts.steps[stepAtual][i];
              xlog("# ORIGEM: q" + estado);
              var destino = dts.destinos[estado][chrIndex];

              if (typeof estado === "number"){
                if (Array.isArray(destino)){
                  for (g = 0; g < destino.length; g++){
                    xlog("  - ADDED-MULTI: q" + destino[g]);
                    if ((typeof destino[g] === "number") && (destino[g] >= 0)){
                      newStep.push(destino[g]);
                    }else{
                      throw "[ERRO] Destino Invalido.";
                    }

                    if (typeof callback === "function"){
                      callback(chr, stepAtual+1, i, newStep, destino[g], 2);
                    }
                  }
                }else if ((typeof destino === "number") && (destino >= 0)){
                  xlog("  - ADDED: q" + destino);
                  newStep.push(destino);

                  if (typeof callback === "function"){
                    callback(chr, stepAtual+1, i, newStep, destino, 2);
                  }
                }
              }else{
                xlog(dts.steps);
                xlog(estado);
                xlog(destino);
                throw "[ERRO] Estado invalido presente na sequencia.";
              }
            }

            if (newStep.length > 0){
              dts.steps.push(newStep);
            }
          }
        }else {
          xlog("Inicializando");
          dts.steps = [[dts.start]];

          if (typeof callback === "function"){
            callback(str[0], 0, null, null, dts.start, 2);
          }
        }

        return dts;
      }

      function processEpsilons(char, dts, callback){
        /* EXPAND OS EPSON */
        dts = expandEpsilon(dts, (callback));

        if (typeof callback === "function"){
          callback(char, dts.steps.length-1, i, null, null, 1);
        }

        return dts;
      }

      function processChars(char, dts, callback){
        this.dts = processStep(char, dts, callback);

        if (typeof callback === "function"){
          callback(str[i], dts.steps.length-1, i, null, null, 3);
        }

        return dts;
      }

      str       = ((typeof str === "string") && (str.length > 0)) ? str : dtsOuStr;
      this.dts  = processStep(null, (typeof dtsOuStr === "object") ? dtsOuStr : this.dts, (callback));
      xlog(str);

      for (var i = 0; i < str.length; i++) {
        /* EXPAND OS Epsilon */
        this.dts =  processEpsilons(str[i], this.dts, callback);

        /* PROCESSANDO CARACTERE */
        this.dts =  processChars(str[i], this.dts, callback);
      }

      /* EXPANCAO FINAL DOS Epsilon */
      this.dts =  processEpsilons(str[i], this.dts, callback);
      
      var final = false;
      for (var i = 0; i < this.dts.finais.length; i++){
        if (this.dts.steps[this.dts.steps.length-1].indexOf(this.dts.finais[i]) >= 0){
          final = true;

          break;
        }
      }
      
      xlog(":::::::");
      
      if (final){         
        xlog("= String Aceita");
      }else{
        xlog("= String NÃO Aceita");        
      }
      
      return final;
    };
  };
})(window, (typeof jQuery === "object" ? jQuery : Zepto), function(t){
  console.log(t);
});