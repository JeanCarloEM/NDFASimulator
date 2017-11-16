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

window.predefs = [
  {'json': {"abto": ["ω", ".", "-", "_", "@", "ε"], "destinos": [[1, "", "", "", "", ""], ["1,5", 2, 4, 3, "", ""], [5, "", "", "", "", ""], [5, "", "", 3, "", ""], [5, "", "", "", "", ""], [5, "", "", "", 6, 1], [7, "", "", "", "", ""], ["7,10", 8, 9, "", "", ""], ["10", "", "", "", "", ""], ["10", "", "", "", "", ""], ["10", "11", "", "", "", 7], ["12", "", "", "", "", ""], ["14", "", "13", "", "", ""], ["14", "", "", "", "", ""], ["14", "", "13", "", "", ""]], "start": 0, "finais": [14], "steps": [[]]},
    "chars": "ω.-_@ε"
  },
  {
    'json': {"abto":["Δ",".",",","ε"],"destinos":[[1,"","",""],[2,"","",3],[3,"","",3],["",7,4,""],[5,"","",""],[6,"","",""],["","","",""],[8,"","",""],[9,"","",""],[3,"","",""]],"start":0,"finais":[6],"steps":[[]]},
    'chars': 'Δ.,ε'
  },
  {
    'json': {"abto":["0","1"],"destinos":[["",1],["1,2",1],["",""]],"start":0,"finais":[2],"steps":[[]]},
    'chars': '01'
  },
  {
    'json' : {"abto":["0","1"],"destinos":[[2,1],[3,0],[0,3],[1,2]],"start":0,"finais":[0],"steps":[[]]},
    'chars': '01'
  }
];



(function (window, $) {
  window.buildTbl = function (json, chars) {
    if (typeof json === "object") {
      $("input[name='alfabeto']").val(chars);

      window.setSigma();

      for (var st = 0; st < json.destinos.length; st++){
        $("section.principal div.tbl button").trigger("click");
        var inputs = $(".tbl table tr:last-of-type td input");

        for (var c = 0; c < inputs.length; c++){
          $(inputs[c]).val(json.destinos[st][c]);
        }

        if (json.finais.indexOf(st) >= 0){
          $(".tbl table tr:last-of-type td:first-of-type").trigger("click");
        }
      }
    }

    return false;
  };

  window.updateTbl = function (chr, stepAtual, iterador, newStep, destino, final, evento) {
    var tbl = $("#passos tr");

    if ((!tbl) || (tbl.length <= 0)) {
      if ((!$("article")) || ($("article").length <= 0)) {
        throw "ARTICLE NADA AINDA";
      }

      $("article").append("<div class='estados'><table id='passos' cellpadding='0' cellspacing='0'><tr></tr><tr></tr></table></div>");
      tbl = $("#passos tr");
    }

    /* EVENTO DE ADICAO INDIVIDUAL */
    if ((evento >= 0) && (evento <= 3)) {
      if ($("#passos tr:last-of-type td").length <= stepAtual) {
        tbl.append("<td step='"+stepAtual+"' id='td_" + stepAtual + "'"+(stepAtual===0?"class='ativo'":'')+"></td>");
      }

      if ((typeof chr === "string") && (chr.length > 0) && (!$("#passos tr:first-of-type td#td_" + (stepAtual - 1)).html())) {

        $("#passos tr:first-of-type td#td_" + (stepAtual - 1)).html(chr);
      }

      if ((evento === 0) || (evento === 2)) {
        if ((destino !== null) && (destino >= 0) && ($("#passos tr td:last-of-type div.q" + destino).length <= 0)) {
          var coluna = $("#passos tr:last-of-type td#td_" + stepAtual);
          coluna.append("<div st='"+destino+"' class='" + ((evento === 0) ? " epson" : "") + (((window.lfacalc.dts.finais.indexOf(destino) >= 0) || final) ? " final" : "") + " q" + destino + "'><span>q" + destino + "</span></div>");
        }
      }
    }
  };

  window.setSigma = function () {
    var inp = $("section.principal div.sigma input[type='text']");

    inp.val(inp.val().replace(/(.)(?=.*\1)/g, ""));

    if (inp.val() !== inp.attr("old")) {
      $("#estados").html(" ");
      $("section.principal div.avaliar").css("display", "none");
      $('section.principal >div.automato').css('display', 'none');

      if (inp.val().length > 1) {
        var tr1 = "";

        for (var i = 0; i < inp.val().length; i++) {
          tr1 += "<td>" + ((inp.val()[i] === "ε") ? "&epsilon;" : (inp.val()[i] === "Δ") ? "[0-9]" : (inp.val()[i] === "α") ? '[a-zA-Z]' : (inp.val()[i] === "ω") ? '[a-zA-Z0-9]' : inp.val()[i]) + "</td>";
        }

        $("#estados").html("<tr><td>ST</td>" + tr1 + "</tr>");
        $("section.principal div.tbl").css("display", "block");
      }


      inp.attr("old", inp.val());
    }
  };

  window.validadeEstados = function (e, forceparam) {
    $('section.principal >div.automato').css('display', 'none');
    forceparam = (forceparam === true || forceparam === false) ? forceparam : false;

    e = forceparam ? e : $(this);

    e.removeClass("vazio erro");

    /* REMOVE EVENTUAIS "[, ]" */
    var r = e.val().replace(/[\[\],\s]*/g, '');

    if (e.val().length <= 0) {
      e.addClass("vazio");
      return true;
    }

    var ok = true;

    if (r.length > 0) {
      var rg = new RegExp(e.attr("regex"));

      if (rg.test(e.val())) {
        var maxST = $("#estados tr.estados").length;

        for (var i = 0; i < r.length; i++) {
          if (parseInt(r[i]) >= maxST) {
            ok = false;
            break;
          }
        }
      } else {
        ok = false;
      }
    } else {
      ok = false;
    }

    if (!ok) {
      e.addClass("erro");
      return false;
    }

    return true;
  };

  window.addST = function (st, inicial, final, epslion, coluna) {
    if ($("div.automato2 > div").length <= 0) {
      $("div.automato2").append("<div class='estados'><table id='automato' cellpadding='0' cellspacing='0'><tr></tr><tr></tr></table></div>");
    }

    linhas = $("div.automato2 div table tr");

    coluna = parseInt(coluna);
    coluna = isNaN(coluna) ? $("div.automato2 div tr:last-of-type td").length : coluna;

    if ((linhas.length > 1) && (st >= 0) && (coluna >= 0)) {
      if ($("div.automato2 div table tr td[coluna='" + coluna + "']").length <= 0) {
        linhas.append("<td class='q" + st + "' st='" + st + "' coluna='" + coluna + "'></td>");
      }

      var cel = $("div.automato2 div table tr:last-of-type td[coluna='" + coluna + "']");
      cel.append("<div class='" + ((epslion === true) ? " epson" : "") + ((final) ? " final" : "") + ((inicial) ? " inicial" : "") + " q" + st + "'><span>q" + st + "</span></div>");
    }
  };

  window.STUpdate = function () {

  };

  window.refreshautomato = function(ativo){
    var itens = [];

    var it = $($("article table tr:last-of-type td")[ativo]).children('div');
    for (var st = 0; st < it.length; st++) {
      itens.push(parseInt($(it[st]).attr('st')));
    }

    window.lfadrw($("canvas")[0], JSON.parse(window.ativojson), 64, itens);
  };

  $(document).ready(function () {
    $("section.principal > div div.sigmago").on("click", function () {
      window.setSigma();
    });

    $("section.principal div.sigma input").on("keyup", function (e) {
      if (e.keyCode === 13) {
        $(this).blur();
      }
    });

    $("section.principal div.sigma input").on("blur", function (e) {
      window.setSigma();
    });

    $("section.principal div.avaliar input").on("keyup", function (e) {
      if (e.keyCode === 13) {
        $(this).blur();
      }
    });

    $("section.principal div.avaliar input").on("blur", function (e) {
      $("section.principal div.avaliar > div").trigger("click");
    });

    $("section.principal div.tbl button").on("click", function () {
      var inp = $("section.principal div.sigma input[type='text']");
      $('section.principal >div.automato').css('display', 'none');

      if ((""+inp.attr("old")).length > 1) {
        var tr1 = "";

        for (var i = 0; i < inp.val().length; i++) {
          var id = $.trim($("#estados tr:first-of-type td").eq(i + 1).text());
          id = (id === "ε") ? "__" : (id === "[0-9]") ? "___" : (id === "[a-zA-Z]") ? "____" : (id === "[a-zA-Z0-9]") ? "_____" : id;

          tr1 += "<td><input name='q" + ($("#estados tr").length - 1) + "_" + id + "' type='tel' class='destinos' regex='^(\s*[0-9]+(\s*[,\.\-]\s?[0-9]+)*\s*)?$'></input></td>";
        }

        $("#estados").append("<tr class='estados q" + ($("#estados tr").length - 1) + "' st='" + ($("#estados tr").length - 1) + "'><td class=\"estado\" st='" + ($("#estados tr").length - 1) + "'>q" + ($("#estados tr").length - 1) + "</td>" + tr1 + "</tr>");

        $("#estados tr td:first-of-type").off("click");
        $("#estados tr td input").off("keyup");
        $("#estados tr td input").off("blur");

        $("#estados tr td input").on("keyup", window.validadeEstados);
        $("#estados tr td input").on("blur", window.validadeEstados);
        $("#estados tr > td:first-of-type").on("click", function (e) {
          $(this).toggleClass("checked");
        });

        $("section.principal div.avaliar").css("display", "block");
      }
    });

    $("div.sigma select").on("change", function () {
      if ($(this).attr('selecionado') !== $(this).val()) {
        $(this).attr('selecionado', $(this).val());

        var vlr = chrs = '';

        switch ($(this).val()) {
          case 'email':
            vlr  = window.predefs[0].json;
            chrs = window.predefs[0].chars;
            break;

          case 'moeda':
            vlr  = window.predefs[1].json;
            chrs = window.predefs[1].chars;
            break;

          case 'bit':
            vlr  = window.predefs[2].json;
            chrs = window.predefs[2].chars;
            break;

          case 'bitpar':
            vlr  = window.predefs[3].json;
            chrs = window.predefs[3].chars;
            break;
        }

        window.buildTbl(vlr, chrs);
      }
    });

    $("div.sigma table td:first-of-type").on("click", function () {
      console.log($(this).text());
      if ($("div.sigma input").val().indexOf($(this).text()) < 0) {
        $("div.sigma input").val($("div.sigma input").val() + $(this).text());
        $("div.sigma input").focus();

        window.setSigma();
      }
    });


    $('div.automato div.passo button.next').on('click', function(){
      if (window.ativojson){
        var ativo = parseInt($("article table tr:last-of-type td.ativo").attr('step'));
        if ((ativo >= 0) && ($("article table tr:last-of-type td").length > (ativo+1))){
          ativo++;

          $("article table tr td").removeClass('ativo');

          $($("article table tr:last-of-type td")[ativo]).addClass('ativo');
          $($("article table tr:first-of-type td")[ativo]).addClass('ativo');

          window.refreshautomato(ativo);
        }
      }
    });

    $('div.automato div.passo button.prev').on('click', function(){
      if (window.ativojson){
        var ativo = parseInt($("article table tr:last-of-type td.ativo").attr('step'));

        if (ativo > 0){
          ativo--;
          $("article table tr td").removeClass('ativo');

          $($("article table tr:last-of-type td")[ativo]).addClass('ativo');
          $($("article table tr:first-of-type td")[ativo]).addClass('ativo');

          window.refreshautomato(ativo);
        }
      }
    });

    $("section.principal div.avaliar > div").on("click", function () {
      if ($("section.principal div.avaliar input").val().length > 0) {
        $("section.principal div.avaliar input").removeClass('erro');

        var inps = $("#estados tr td input");

        var ok = true;
        if (inps.length > 0) {
          for (var i = 0; i < inps.length; i++) {
            var btb = $(inps[i]);
            if (!window.validadeEstados(btb, true)) {
              ok = false;
              break;
            }
          }
        } else {
          ok = false;
        }

        if (ok) {
          var json = {
            abto: ($("section.principal div.sigma input").val().split('')),
            destinos: [],
            start: 0,
            finais: [],
            steps: [[]]
          };

          /*
           * IDENTIFICANDO EPSILON
           */
          for (var i = 0; i < json.abto.length; i++) {
            json.abto[i] = json.abto[i];
          }

          /*
           * OBTENDO OS ESTADO FINAIS
           */
          var qs = $("#estados tr > td.estado:first-of-type");

          for (var i = 0; i < qs.length; i++) {
            if ($(qs[i]).hasClass("checked")) {
              json.finais.push(parseInt($(qs[i]).attr("st")));
            }
          }

          /*
           * MONTANDO A TABELA DE DESTINOS
           */
          var trs = $("#estados tr.estados");
          for (var i = 0; i < trs.length; i++) {
            var q = $(trs[i]).attr("st");
            var st = [];

            for (var j = 0; j < json.abto.length; j++) {
              var vl = $("#estados tr td input[name='q" + q + "_" + ((json.abto[j] === 'ε') ? "__" : (json.abto[j] === 'Δ') ? "___" : (json.abto[j] === 'α') ? "____" : (json.abto[j] === 'ω') ? "_____" : json.abto[j]) + "']").val();
              if (/^[0-9]$/.test(vl)) {
                st.push(parseInt(vl));
              } else {
                st.push(vl);
              }
            }

            json.destinos.push(st);
          }


          if (json.start >= json.destinos.length) {
            alert("[ERRO] o Estado Inicial selecionado (" + json.start + ") é superior ao estado maior (" + (json.destinos.length - 1) + ")");
            return 0;
          }

          if (!window.lfacalc) {
            window.lfacalc = new window.lfa();
          }

          $("article").html(" ");
          $("div.automato2").html(" ");

          /*console.log(JSON.stringify(json));*/

          /*
           * CONVERTE A TABELA EM EXPRESSAO REGULAR
           *
           * === AINDA NAOIMPLETADO
           *
           * POREM, ESTA FUNCAO FAZ OUTROS PROCESSAMENTOS QUE SAO EXIGIDOS PELO
           * DRAW, POR ISSO NOS A INVOCAMOS MESMO ASSIM
           */
          window.regex = new window.lfaRegex();
          json = regex.make(json, null/*window.addST*/, null);//window.STUpdate);

          window.ativojson = JSON.stringify(json);

          $('section.principal >div.automato').css('display', 'block');
          window.lfadrw($("canvas")[0], json, 64);

          if (window.lfacalc.match(json, $("section.principal div.avaliar input").val(), window.updateTbl)) {
            $("div.resultado").html("O Autômato ("+(window.lfacalc.dts.nfa?"AFND":"AFD")+") reconhece a string. String aceita!");
          } else {
            $("div.resultado").html("O Autômato ("+(window.lfacalc.dts.nfa?"AFND":"AFD")+") NÃO reconhece a string. String rejeitada!");
          }
        } else {
          alert("O estados destinos não estão preenchidos corretamente!");
        }
      } else {
        $("section.principal div.avaliar input").addClass('erro');
      }
    });
  });
})(window, (typeof jQuery === "object" ? jQuery : Zepto));
