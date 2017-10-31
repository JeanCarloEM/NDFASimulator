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

(function (window, $) {
  window.updateTbl = function (chr, stepAtual, iterador, newStep, destino, final, evento) {
    var tbl = $("#passos tr");

    if ((!tbl) || (tbl.length <= 0)) {
      if ((!$("article")) || ($("article").length <= 0)) {
        throw "ARTICLE NADA AINDA";
      }

      $("article").append("<div><table id='passos' cellpadding='0' cellspacing='0'><tr></tr><tr></tr></table></div>");
      tbl = $("#passos tr");
    }

    /* EVENTO DE ADICAO INDIVIDUAL */
    if ((evento >= 0) && (evento <= 3)) {
      if ($("#passos tr:last-of-type td").length <= stepAtual) {
        tbl.append("<td id='td_" + stepAtual + "'></td>");
      }

      if ((typeof chr === "string") && (chr.length > 0) && (!$("#passos tr:first-of-type td#td_" + (stepAtual - 1)).html())) {

        $("#passos tr:first-of-type td#td_" + (stepAtual - 1)).html(chr);
      }

      if ((evento === 0) || (evento === 2)) {
        if ((destino !== null) && (destino >= 0) && ($("#passos tr td:last-of-type div.q" + destino).length <= 0)) {
          var coluna = $("#passos tr:last-of-type td#td_" + stepAtual);
          coluna.append("<div class='" + ((evento === 0) ? " epson" : "") + (((window.lfacalc.dts.finais.indexOf(destino) >= 0) || final) ? " final" : "") + " q" + destino + "'><span>q" + destino + "</span></div>");
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

      if (inp.val().length > 1) {
        var tr1 = "";

        for (var i = 0; i < inp.val().length; i++) {
          tr1 += "<td>" + ((inp.val()[i] === "@") ? "&epsilon;" : inp.val()[i]) + "</td>";
        }

        $("#estados").html("<tr><td>ST</td>" + tr1 + "</tr>");
        $("section.principal div.tbl").css("display", "inline-block");
      }


      inp.attr("old", inp.val());
    }
  };

  window.validadeEstados = function (e, forceparam) {
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
      var inp = $("section.principal > div input[type='text']");

      if (inp.attr("old").length > 1) {
        var tr1 = "";

        for (var i = 0; i < inp.val().length; i++) {
          var id = $.trim($("#estados tr:first-of-type td").eq(i + 1).text());
          id = (id == "ε") ? "__" : id;

          tr1 += "<td><input name='q" + ($("#estados tr").length - 1) + "_" + id + "' type='tel' class='destinos' regex='^(\s*[0-9](\s*[,\.\-]\s?[0-9])*\s*)?$'></input></td>";
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
            start: $("section.principal div.starterq input").val(),
            finais: [],
            steps: [[]]
          };

          /*
           * IDENTIFICANDO EPSILON
           */
          for (var i = 0; i < json.abto.length; i++) {
            json.abto[i] = json.abto[i] === "@" ? null : json.abto[i];
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
              var vl = $("#estados tr td input[name='q" + q + "_" + ((json.abto[j] === null) ? "__" : json.abto[j]) + "']").val();
              st.push("" + vl);
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
          if (window.lfacalc.match(json, $("section.principal div.avaliar input").val(), window.updateTbl)) {
            $("div.resultado").html("O Autômato reconhece a string. String aceita!");
          } else {
            $("div.resultado").html("O Autômato NÃO reconhece a string. String rejeitada!");
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