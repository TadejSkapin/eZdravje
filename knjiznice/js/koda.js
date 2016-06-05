
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
    var ID =generirajPodatke(1);
    ID = generirajPodatke(2);
    ID = generirajPodatke(3);
}

function generirajPodatke(stPacienta) {
	var vrni = '';
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
  return vrni;
}

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

function dodajSimptom() {
	sessionId = getSessionId();
    
    var e = document.getElementById("dodajSimptomSimptom");
    var simptom = e.options[e.selectedIndex].value;
	var ehrId = $("#dodajSimptomEHR").val();
	var datumInUra = $("#dodajSimptomDatumInUra").val();
    var merilec = 'uporabnik';

	if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajSimptomSporocilo").html("<span class='obvestilo " +
      "label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
		    "ctx/language": "en",
		    "ctx/territory": "SI",
            "ctx/time": datumInUra, 
			"vital_signs/body_weight/any_event/body_weight": simptom
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: merilec
		};
	$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		        $("#dodajSimptomSporocilo").html(
              "<span class='obvestilo label label-success fade-in'>" +
              res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#dodajSimptomSporocilo").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
            JSON.parse(err.responseText).userMessage + "'!");
		    }
		});
	}
}

function preberiSimptome() {
    sessionId = getSessionId();

	var ehrId = $("#preberiSimptomeEHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#preberiSimptomeSporocilo").html("<span class='obvestilo " +
      "label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},	
	    	success: function (data) {
				var party = data.party;
				$("#preberiSimptomeSporocilo").html("<br/><span>Pridobivanje " +
                    "simpotomov za bolnika <b>'" + party.firstNames +" " + party.lastNames + "'</b>.</span><br/><br/>");
    			$.ajax({
      			    url: baseUrl + "/view/" + ehrId + "/" + "weight",
    			    type: 'GET',
    			    headers: {"Ehr-Session": sessionId},
    			    success: function (res) {
    			        	if (res.length > 0) {
    	    			    	var results = "<table class='table table-striped" +
                             "<th class='table-hover'>Simptom</th></tr>";
    				        for (var i in res) 
    				        {
								var Symptom = res[i].weight;
    				            switch(res[i].weight) {
									case 100:
										Symptom = 'Vnetje';
										break;
									case 110:
										Symptom = 'Prehlad';
										break;
									case 120:
										Symptom = 'Bolečina';
										break;	
									case 130:
										Symptom = 'Glavobol';
										break;
									case 140:
										Symptom = 'Vročina';
										break;
									case 150:
										Symptom = 'Gripa';
										break;
									case 160:
										Symptom = 'Kašelj';
										break;
									case 170:
										Symptom = 'Draženje';
										break;
									case 180:	
										Symptom = 'Nahod';
										break;	
									case 190:
										Symptom = 'Zobobol';
										break;
									case 200:
										Symptom = 'Srbenje';
										break;
									case 210:
										Symptom = 'Stres';
										break;
									case 220:	
										Symptom = 'Poškodba';
										break;
									case 230:
										Symptom = 'Okužba';
										break;
									case 240:
										Symptom = 'Prebava';
										break;
									case 250:
										Symptom = 'Alergija';
										break;
									case 260:
										Symptom = 'Zaprtje';
										break;
									case 270:
										Symptom = 'Migrena';
										break;
									case 280:
										Symptom = 'Artritis';
										break;
									case 290:
										Symptom = 'Glivice';
										break;
									case 300:
										Symptom = 'Kihanje';
										break;
									default:
										break; 
						} 
    				            results += "<tr><td class='text-left'>" + Symptom + "</td>";
//							    results += "<td class='text-right'><b>" + res[i].time + "</b></td>";
    				        }
    				        results += "</table>";
    				        $("#simpotomiDoZdaj").append(results);
    				        
    				        $('.text-left').click(function(){
    				        	var parameter = $(this).text().toLowerCase();
								odpriLekarno(parameter);
							});
    			    	} else {
    			    		$("#preberiSimptomeSporocilo").html(
                             "<span class='obvestilo label label-warning fade-in'>" +
                                "Ni podatkov!</span>");
    			    	}
    			    },
    			    error: function() {
    			    	$("#preberiSimptomeSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" +
                        JSON.parse(err.responseText).userMessage + "'!");
    			    }
    			});
	    	},
	    	error: function(err) {
	    		$("#preberiSimptomeSporocilo").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
            JSON.parse(err.responseText).userMessage + "'!");
	    	}
		});
	}
}

function odpriLekarno(tableCell) {
	var cilj = 'http://www.lekarnar.com/oddelki/zdravila-brez-recepta?simptom_facet=' +tableCell + '&sort=score';
	var povezava='<iframe src="' +cilj +'" width="100%" height="100%"></iframe>';
	$("#lekarnarPovezava").append(povezava);
}

