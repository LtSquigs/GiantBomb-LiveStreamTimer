// Loads up jQeury UI (and a few other things) into the page so we can use them

var custJquery = $;

timerInitialize();

function timerInitialize()
{
	$('<div id="elapsedTime" style="position:fixed; left: 5px; bottom: 5px; color: white;">The live stream has been running for 0 minutes</div>').appendTo('body');
			
	updateTime();
	setInterval("updateTime()", 180000);
}

function updateTime()
{
	var channel = "";
	var failed = false;
	var show = null;
	
	$.ajax({	url : 'http://api.giantbomb.com/chats/?api_key=3c2be6c0f6d10150f5fb7227317816115c717938&format=json',
				type: "GET",
				dataType : "json",
				success: function(data) {
					var worked = data["error"];
					
					if(worked != "OK")
					{
						failed = true;
						return;
					}
					
					var shows = data["results"];
					
					for(var i = 0; i < shows.length; i++)
					{
						if(shows[i]["site_detail_url"] == "http://www.giantbomb.com/chat/" || shows[i]["site_detail_url"] == "http://www.giantbomb.com/chat/")
						{
							show = shows[i];
							break;
						}
					}
					
					if(show == null)
						failed = true;
				},
				error: function(a, b, c) {
					failed = true;
				},
				async: false
			});
		
	if(failed)
	{
		$('#elapsedTime').text("Error parsing chat information from Giantbomb API");
		return;
	}
		
	channel = show["channel_name"];
	
	var jtvAPI = "http://api.justin.tv/api/stream/list.json?channel=" + channel;
	failed = false;
	
	
	$.ajax({	url : jtvAPI,
				type: "GET",
				dataType : "json",
				success: function(data) {
					if(data.length < 1)
					{
						// Perhaps say it hasnt started yet?
						$('#elapsedTime').text("Show does not appear to be streaming yet");
						return;
					}
					
					var show = data[0];
					
					var datestr = show["up_time"];
					
					if(DST())
						datestr = datestr + " PDT";
					else
						datestr = datestr + " PST";
						
					var up_time = new Date(Date.parse(datestr));
					
					var cur_time = new Date();
					
					var diff = (cur_time.getTime() - up_time.getTime()) / (1000 * 60);
					$('#elapsedTime').text("The live stream has been running for " + Math.floor(diff) + " minutes");
					
				},
				error: function(a, b, c) {
					failed = true;
				},
				async: false
			});
			
			
	if(failed)
	{
		$('#elapsedTime').text("Error parsing show information from the justinTV API");
		return;
	}
}

// Borrowed from the internet
function DST(){
	var today = new Date;
	var yr = today.getFullYear();
	var dst_start = new Date("March 14, "+yr+" 02:00:00"); // 2nd Sunday in March can't occur after the 14th 
	var dst_end = new Date("November 07, "+yr+" 02:00:00"); // 1st Sunday in November can't occur after the 7th
	var day = dst_start.getDay(); // day of week of 14th
	dst_start.setDate(14-day); // Calculate 2nd Sunday in March of this year
	day = dst_end.getDay(); // day of the week of 7th
	dst_end.setDate(7-day); // Calculate first Sunday in November of this year
	if (today >= dst_start && today < dst_end){ //does today fall inside of DST period?
		return true; //if so then return true
	}
	return false; //if not then return false
}