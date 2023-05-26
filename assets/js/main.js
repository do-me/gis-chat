$(document).ready(function() {

(function($) {
	// Breakpoints.
	breakpoints({
		xlarge:  [ '1281px',  '1800px' ],
		large:   [ '981px',   '1280px' ],
		medium:  [ '737px',   '980px'  ],
		small:   [ '481px',   '736px'  ],
		xsmall:  [ null,      '480px'  ],
	});

	var $window = $(window),
	$body = $('body'),
	$header = $('#header'),
	$footer = $('#footer'),
	$main = $('#main')

	// Footer.
	breakpoints.on('<=medium', function() {
		$footer.insertAfter($main);
	});

	breakpoints.on('>medium', function() {
		$footer.appendTo($header);
	});
})(jQuery);


// Check if there's any override. If so, let the markup know by setting an attribute on the <html> element
const colorModeOverride = window.localStorage.getItem('color-mode');

const hasColorModeOverride = typeof colorModeOverride === 'string';
if (hasColorModeOverride) {
	document.documentElement.setAttribute('data-force-color-mode', colorModeOverride);
}

if ((colorModeOverride == 'dark') || (!hasColorModeOverride && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
	document.querySelector('#toggle-darkmode').checked = true;
}

const setColorMode = (mode) => {
    if (mode) {
        document.documentElement.setAttribute('data-force-color-mode', mode);
        window.localStorage.setItem('color-mode', mode);
        document.querySelector('#toggle-darkmode').checked = (mode === 'dark');
    }
    else {
        document.documentElement.removeAttribute('data-force-color-mode');
        window.localStorage.removeItem('color-mode');
        document.querySelector('#toggle-darkmode').checked = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
}

document.querySelector('#toggle-darkmode').addEventListener('click', (e) => {
	setColorMode(e.target.checked ? 'dark' : 'light');
});

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addListener(() => {
	if (document.documentElement.getAttribute('data-force-color-mode')) {
		return;
	}
 	document.querySelector('#toggle-darkmode').checked = mediaQuery.matches;
});

// dark mode end

var tileLayerUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
var tileLayerOptions = {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
maxZoom: 18,
};
if (map != undefined) { map.remove(); }

var tileLayer = L.tileLayer(tileLayerUrl, tileLayerOptions);
var map = L.map('map', {
	fullscreenControl: true,
	fullscreenControlOptions: {
	  position: 'topleft'
	}
  }).setView([51.505, 0], 5);
tileLayer.addTo(map);

includeList = ["name","rendered_description"]

const capitalizeFirstLetter = ([firstLetter, ...restOfWord]) =>
  firstLetter.toUpperCase() + restOfWord.join("");

function capitalizeEveryWord(str) {
	return str
		.split('_')
		.map(word => capitalizeFirstLetter(word))
		.join(' ');
}  

fetch('data/streams.json')
.then(response => response.json())
.then(data => {
  var markers = []; // array to hold all markers

	data.forEach(item => {
		// Extract the coordinates from the description
		var coords = item.description.match(/\[(.*),\s*(.*)\]/);
		if (coords) {
			var lat = parseFloat(coords[1]);
			var lng = parseFloat(coords[2]);

			// Create a marker at the coordinates
			var marker = L.marker([lat, lng]).addTo(map);
      markers.push(marker); // add marker to array

			// Add a popover with the other nodes formatted as a table
			var tableHtml = '<div class="table-wrapper"><table class="alt">';
			//console.log(item)
			Object.keys(item).forEach(function(key) {
				// Access each property using the key
				var otherItem = item[key];

				if (includeList.includes(key)) {

					if(key == "rendered_description"){
						key = "Location"
					}

					if(key == "name"){
						key = "Chat"
						tableHtml += '<tr><td>' + capitalizeEveryWord(key) + '</td><td><a href="https://zulip.gis.chat/#narrow/stream/' + item["stream_id"] + '">'  + otherItem + '</a></td></tr>'; // https://zulip.gis.chat/#narrow/stream/12
						return
					}

					tableHtml += '<tr><td>' + capitalizeEveryWord(key) + '</td><td>' + otherItem + '</td></tr>'; // https://zulip.gis.chat/#narrow/stream/12
				}
				
			  });
			
			tableHtml += '</table></div>';
			marker.bindPopup(tableHtml, {className: 'LeafletPopup'});
		}
	});

  var bounds = L.latLngBounds(markers.map(marker => marker.getLatLng()));

  // fit the map to the bounds
  map.fitBounds(bounds);
});
});

/*
	Strata by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/
