
if (document.location.hash != '#ba'){
	document.getElementById('rct').style.display='none';
} else {
	document.getElementById('only-op').style.display='none';
	document.getElementById('rct').onclick = reportCurrentTab;
}

document.body.className = document.location.hash.split('#').join('');

function dsj_event(action){
	if (typeof dsj_events != 'undefined') {
		dsj_events('send', 'event', 'options', action);
	}
}

function dsj_event_detail(action, label, value){
	if (typeof dsj_events != 'undefined') {
		dsj_events('send', 'event', 'options', action, label, value);
	}
}

function morestrictnessinfo(){
	document.getElementById('strictnessinfo').style.opacity = 1;
	document.getElementById('strictnessinfo').style.zIndex = 99;
}

function lessstrictnessinfo(){
	document.getElementById('strictnessinfo').style.opacity = 0;
	setTimeout(function(){
		document.getElementById('strictnessinfo').style.zIndex = -1;
	}, 500);
}

document.getElementById('strictnessinfoToggle').addEventListener("mouseout",lessstrictnessinfo);
document.getElementById('strictnessinfoToggle').addEventListener("mouseover",morestrictnessinfo);

// Saves options to chrome.storage.sync.
function save_options() {
	var strictness = document.getElementById('strictness').value;
	var debug = document.getElementById('debug').checked;

	var levels = ['off', 'medium', 'strict'];
	
	chrome.storage.sync.set({
		strictness: strictness,
		debug: debug,
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.style.display="block";
		setTimeout(function() {
			status.style.display="none";
		}, 1000);
	});
}

var eventsCode = 'UA-78286573-1';
var eventsLoaded = false;


// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	// Use default values
	chrome.storage.sync.get({
		strictness: 'medium',
		debug: false,
	}, function(settings) {
		document.getElementById('strictness').value = settings.strictness;
		document.getElementById('debug').checked = settings.debug;

	});
}

function getCurrentTabUrl(callback) {

	var queryInfo = {
		active: true,
		currentWindow: true
	};

	chrome.tabs.query(queryInfo, function(tabs) {
		var tab = tabs[0];

		var url = tab.url;

		callback(url);
	});
}

function makeReportUrl(form, extra){
	var object = {
		name: 'optional',
		email: 'optional@co.com',
		issue_title: 'optional',
		details: [
			'When I was: ',
			'This happened: ',
			'When what should have happened was: '
		].join(encodeURIComponent('\n\n'))
	};

	if (form){
		for (var i in form){
			object[i] = form[i];
		}
	}

	var debugInfo = {
		ua : navigator.userAgent,
	};

	for (var j in extra){
		debugInfo[j] = extra[j];
	}

	object.details += encodeURIComponent('\n \n \n')+'Debug Info: '+encodeURIComponent(JSON.stringify(debugInfo, null, 2));
	
	var urlParts = [];

	for (var key in object){
		urlParts.push([key,object[key]].join('='));
	}

	var reportURL = 'https://gitreports.com/issue/joshbalfour/disable-scroll-jacking?'+urlParts.join('&');
	
	return reportURL;
}

function reportCurrentTab(){
	getCurrentTabUrl(function(url){
		var reportURL = makeReportUrl({
			issue_title: url+' is stealing my scrollbar!',
			details: 'Please fill in the CAPTCHA and click submit'
		}, {currentPage: url});
		dsj_event_detail('report_url', url);
		window.open(reportURL);
	});

}

function reportIssue(){
	if (document.location.hash == '#ba'){
		getCurrentTabUrl(function(url){
			window.open(makeReportUrl(null, {currentPage: url}));
			dsj_event_detail('report_issue', url);
		});
	} else {
		window.open(makeReportUrl());
	}
}

document.getElementById('reportIssue').onclick = reportIssue;

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
		save_options);
