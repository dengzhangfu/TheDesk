/*投稿系*/ 
//投稿
function sec(){
	var mode=localStorage.getItem("sec");
	var acct_id = $("#post-acct-sel").val();
	var domain = localStorage.getItem("domain_" + acct_id);
	if(~domain.indexOf("kirishima.cloud")>=0 && mode=="local"){
		mode="unlisted";
	}
	post(null,mode);
}
function post(mode,postvis) {
	if($("#toot-post-btn").prop("disabled")){
		return false;
	}
	var str = $("#textarea").val();
	var acct_id = $("#post-acct-sel").val();
	localStorage.setItem("last-use", acct_id);
	var domain = localStorage.getItem("domain_" + acct_id);
	if(domain=="theboss.tech"){
		if(~str.indexOf("#")){
			if(str.indexOf("#theboss_tech")=="-1"){
				if(!confirm(lang.lang_post_tagTL)){
					return false;
				}
			}
		}
	}
	if(domain=="dtp-mstdn.jp"){
		if(~str.indexOf("#")){
			if(str.indexOf("#dtp")=="-1"){
				if(!confirm(lang.lang_post_tagTL)){
					return false;
				}
			}
		}
	}
	if(!localStorage.getItem("cw_sentence")){
		var cw_sent=500;
	}else{
		var cw_sent=localStorage.getItem("cw_sentence");
	}
	if(!localStorage.getItem("cw_letters")){
		var cw_ltres=500;
	}else{
		var cw_ltres=localStorage.getItem("cw_letters");
	}
	if(domain!="kirishima.cloud"){
	if(mode!="pass" && !$("#cw").hasClass("cw-avail") && (str.length>cw_sent || (str.split("\n").length - 1)>cw_ltres)){
		var electron = require("electron");
		var remote=electron.remote;
		var dialog=remote.dialog;
		var plus=str.replace(/\n/g,"").slice(0,10)+"...";
		const options = {
			type: 'info',
			title: lang.lang_post_cwtitle,
			message: lang.lang_post_cwtxt+plus,
			buttons: [lang.lang_post_btn1,lang.lang_post_btn2, lang.lang_post_btn3]
	  }
	  dialog.showMessageBox(options, function(arg) {
			if(arg===1){
				$("#cw-text").show();
				$("#cw").addClass("yellow-text");
				$("#cw").addClass("cw-avail");
				$("#cw-text").val(plus);
				post("pass");
			}else if(arg===2){
				post("pass");
			}
	  	})
		  return false;
	}
}
	if(localStorage.getItem("mode_" + domain)=="misskey"){
		misskeyPost();
		return;
	}
	$(".toot-btn-group").prop("disabled", true);
	todo("Posting");
	var at = localStorage.getItem("acct_"+ acct_id + "_at");
	var start = "https://" + domain + "/api/v1/statuses";
	var reply = $("#reply").val();
	if(str.indexOf(localStorage.getItem("stable"))==-1){
		str+" #"+localStorage.getItem("stable");
	}
	var toot={
		status: str
	}
	if(reply){
		toot.in_reply_to_id=reply
	}
	var media = $("#media").val();
	if(media){
		toot.media_ids=media.split(",");
	}
	if ($("#nsfw").hasClass("nsfw-avail")) {
		var nsfw = "true";
		toot.sensitive=nsfw;
	} else {
		var nsfw = "false";
	}
	if(postvis){
		var vis = postvis;
	}else{
		var vis = $("#vis").text();
	}
	
	if(vis!="inherit" && vis!="local"){
		toot.visibility=vis;
	}else if(vis=="local"){
		toot.status=str+"👁️";
	}
	//ここに非公開・未収載タグについてwarn
	if(domain!="kirishima.cloud" && domain!="imastodon.net"){
	if(~str.indexOf("#")){
		if(vis == "local" || vis=="unlisted" || vis=="direct" || vis=="private"){
			if(!confirm(lang.lang_post_tagVis)){
				return false;
			}
		}
	}
}
	if ($("#cw").hasClass("cw-avail")) {
		var spo = $("#cw-text").val();
		cw();
		toot.spoiler_text=spo;
	} else {
		var spo = "";
	}
	if ($("#sch-box").hasClass("sch-avail")) {
		var scheduled=formattimeutc(new Date(Date.parse($("#sch-date").val())))
		console.log(scheduled)
		schedule();
		toot.scheduled_at=scheduled;
	} else {
		var scheduled = "";
	}
	if ($("#poll-sel").val()=="mastodon-poll") {
		var options=[];
		$(".mastodon-choice").map(function() {
			var choice=$(this).val();
			if(choice!=""){
				options.push(choice);
			}
		});
		if($("#poll-multiple:checked").val()=="1"){
			var mul=true;
		}else{
			var mul=false;
		}
		if($("#poll-until:checked").val()=="1"){
			var htt=true;
		}else{
			var htt=false;
		}
		var exin=pollCalc();
		if(!exin){
			todc("Error: Poll expires_in param")
		}
		toot.poll={
			options: options,
			expires_in: exin,
			multiple: mul,
			hide_totals: htt
		}
	}
	console.log(toot);
	var httpreq = new XMLHttpRequest();
	httpreq.open('POST', start, true);
	httpreq.setRequestHeader('Content-Type', 'application/json');
	httpreq.setRequestHeader('Authorization', 'Bearer ' + at);
	httpreq.responseType = "json";
	httpreq.send(JSON.stringify(toot));
    httpreq.onreadystatechange = function() {
		if (httpreq.readyState === 4) {
			var json = httpreq.response;
			var box = localStorage.getItem("box");
			if (box == "yes" || !box) {
				$("#textarea").blur();
				hide();
			}
			$(".toot-btn-group").prop("disabled", false);
			todc();
			clear();
		}
	}
}
function misskeyPost(){
	var str = $("#textarea").val();
	var acct_id = $("#post-acct-sel").val();
	localStorage.setItem("last-use", acct_id);
	var domain = localStorage.getItem("domain_" + acct_id);
	$(".toot-btn-group").prop("disabled", true);
	todo("Posting");
	var at = localStorage.getItem("acct_"+ acct_id + "_at");
	var start = "https://" + domain + "/api/notes/create";
	var reply = $("#reply").val();
	var toot={
		text: str
	}
	if(reply){
		if(reply.indexOf("renote")!== -1){
			toot.renoteId=reply.replace("renote_","")
		}else{
			toot.replyId=reply
		}
	}
	
	var media = $("#media").val();
	if(media){
		toot.mediaIds=media.split(",");
	}
	if ($("#nsfw").hasClass("nsfw-avail")) {
		var nsfw = "true";
		toot.sensitive=nsfw;
	} else {
		var nsfw = "false";
	}
	var vis = $("#vis").text();
	if(vis=="unlisted"){
		vis=="home"
	}else if(vis=="direct"){
		vis=="specified";
		toot.visibleUserIds=str.match(/@([a-zA-Z0-9_@.-]+)(\s|$)/g).join('').split("@");
	}
	if(vis!="inherit"){
		toot.visibility=vis;
	}
	if ($("#cw").hasClass("cw-avail")) {
		var spo = $("#cw-text").val();
		cw();
		toot.cw=spo;
	} else {
		var spo = "";
	}
	toot.i=at;
	var httpreq = new XMLHttpRequest();
	httpreq.open('POST', start, true);
	httpreq.setRequestHeader('Content-Type', 'application/json');
	httpreq.responseType = "json";
	httpreq.send(JSON.stringify(toot));
    httpreq.onreadystatechange = function() {
		if (httpreq.readyState === 4) {
			if(str.indexOf(localStorage.getItem("stable"))==-1){
				localStorage.removeItem("stable")
			}
			var json = httpreq.response;
			console.log(json);
			var box = localStorage.getItem("box");
			if (box == "yes") {
				hide();
			}else if (box == "hide"){
				$("body").addClass("mini-post");
				$(".mini-btn").text("expand_less");
			}
			$(".toot-btn-group").prop("disabled", false);
			todc();
			clear();
		}
	}
}

//クリア(Shift+C)
function clear() {
	$("#textarea").val("");
	if(localStorage.getItem("stable")){
		$("#textarea").val("#"+localStorage.getItem("stable")+" ")
	}
	$("#textarea").attr("placeholder", lang.lang_toot);
	$("#reply").val("");
	$("#media").val("");
	var cwt = localStorage.getItem("cw-text");
	if (cwt) {
		$("#cw-text").val(cwt);
	} else {
		$("#cw-text").val("");
	}
	var acw = localStorage.getItem("always-cw");
	if (acw != "yes") {
		$("#cw").removeClass("yellow-text");
		$("#cw").removeClass("cw-avail");
		$("#cw-text").hide();
	}else{
		$("#cw").addClass("yellow-text");
		$("#cw").addClass("cw-avail");
		$("#cw-text").show();
	}
	$("#rec").text(lang.lang_no);
	$("#mec").text(lang.lang_nothing);
	loadVis();
	$("#nsfw").removeClass("yellow-text");
	$("#nsfw").html("visibility_off");
	$("#nsfw").removeClass("nsfw-avail");
	$("#nsc").text(lang.lang_nothing);
	$("#drag").css("background-color", "#e0e0e0");
	$("#preview").html("");
	$(".toot-btn-group").prop("disabled", false);
	$("#post-acct-sel").prop("disabled", false);
	$("#days_poll").val(0);
  $("#hours_poll").val(0);
	$("#mins_poll").val(0);
	$(".mastodon-choice").map(function() {
		$(this).val("");
	});
	localStorage.removeItem("image");
	if(localStorage.getItem("mainuse")=="main"){
		$("#post-acct-sel").val(localStorage.getItem("main"));
	}
	$('select').material_select();
	$("#left-side").show();
	$("#default-emoji").show();
	$("#unreact").show();
	$("#addreact").addClass("hide");
}