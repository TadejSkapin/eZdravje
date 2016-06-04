
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function zacniGeneriranje() {
    generirajPodatke(1);
    generirajPodatke(2);
    generirajPodatke(3);
}
function generirajPodatke(stPacienta) {
  var ehrId = "";
    
  switch (stPacienta) {
    case 1:
        var ime = "Han";
        var priimek = "Yolo";
        var datumRojstva = "2023-06-13T01:02";
        break;
    case 2:
        var ime = "Ragnar";
        var priimek = "Lothbrok";
        var datumRojstva = "1477-04-1T00:00";
        break;
    case 3:
        var ime = "Someone";
        var priimek = "Else";
        var datumRojstva = "1000-01-01T12:34";
        break;
    default:
        break;
  }

        sessionId = getSessionId();
        $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
    	$.ajax({
        url: baseUrl + "/ehr",
        type: 'POST',
        success: function (data) {
            ehrId = data.ehrId;
            var partyData = {
            firstNames: ime,
                lastNames: priimek,
                dateOfBirth: datumRojstva,
                partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
            };
            $.ajax({
                url: baseUrl + "/demographics/party",
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(partyData),
                success: function (party) {
                    if (party.action == 'CREATE') {
                        $("#gen"+stPacienta).html("<span class='obvestilo " +
                      "label label-success fade-in'>Uspešno kreiran EHR za uporabnika "+stPacienta+": '" +
                          ehrId + "'.</span>");
                    $("#preberiEHRid").val(ehrId);
                    }
                },
                        error: function(err) {
                	$("#gen"+stPacienta).html("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka '" +
                JSON.parse(err.responseText).userMessage + "'!");
                }
            });
        }
    });    

  return ehrId;
}

/**
+ * Kreiraj nov EHR zapis za pacienta in dodaj osnovne demografske podatke.
+ * V primeru uspešne akcije izpiši sporočilo s pridobljenim EHR ID, sicer
+ * izpiši napako.
+ */
function kreirajEHRzaBolnika() {
	sessionId = getSessionId();

	var ime = $("#kreirajIme").val();
	var priimek = $("#kreirajPriimek").val();
	var datumRojstva = $("#kreirajDatumRojstva").val();

	if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 ||
      priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#kreirajSporocilo").html("<span class='obvestilo label " +
      "label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        ehrId = data.ehrId;
		        var partyData = {
	            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#kreirajSporocilo").html("<span class='obvestilo " +
                          "label label-success fade-in'>Uspešno kreiran EHR '" +
                              ehrId + "'.</span>");
	                    $("#preberiEHRid").val(ehrId);
		                }
		            },
                            error: function(err) {
		            	$("#kreirajSporocilo").html("<span class='obvestilo label " +
                    "label-danger fade-in'>Napaka '" +
                    JSON.parse(err.responseText).userMessage + "'!");
		            }
		        });
		    }
		});
	}
}
// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
