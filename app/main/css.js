function css(mainWindow) {
	const electron = require("electron");
	const fs = require("fs");
	const path = require('path')
	var ipc = electron.ipcMain;
	var JSON5 = require('json5');
	const app = electron.app;
	const join = require('path').join;
	var customcss = join(app.getPath("userData"), "custom.css");

	ipc.on('custom-css-create', function(e, arg) {
		fs.writeFileSync(customcss, arg);
		mainWindow.webContents.send('custom-css-create-complete', "");
	})
	ipc.on('custom-css-request', function(e, arg) {
		try {
			var css = fs.readFileSync(customcss, 'utf8');
		} catch (e) {
			var css = "";
		}
		mainWindow.webContents.send('custom-css-response', css);
	})
	ipc.on('theme-json-create', function(e, arg) {
		var themecss = join(app.getPath("userData"), JSON5.parse(arg)["id"] +
			".thedesktheme");
		fs.writeFileSync(themecss, JSON.stringify(JSON5.parse(arg)));
		if (JSON5.parse(arg)["id"]) {
			mainWindow.webContents.send('theme-json-create-complete', "");
		} else {
			mainWindow.webContents.send('theme-json-create-complete', "error");
		}
	})
	ipc.on('theme-json-delete', function(e, arg) {
		var themecss = join(app.getPath("userData"), arg + ".thedesktheme");
		console.log(themecss);
		fs.unlink(themecss, function(err) {
			mainWindow.webContents.send('theme-json-delete-complete', "");
		});
	})
	ipc.on('theme-json-request', function(e, arg) {
		var themecss = join(app.getPath("userData"), arg + ".thedesktheme");
		var json = JSON.parse(fs.readFileSync(themecss, 'utf8'));
		mainWindow.webContents.send('theme-json-response', json);
	})
	ipc.on('theme-css-request', function(e, arg) {
		var themecss = join(app.getPath("userData"), arg + ".thedesktheme");
		try {
			var json = JSON.parse(fs.readFileSync(themecss, 'utf8'));

			var primary = json.vars.primary;
			var secondary = json.vars.secondary;
			var text = json.vars.text;
			if (json.base == "light") {
				var drag = "rgba(255, 255, 255, 0.8)";
				var beforehover = "#757575";
			} else {
				var drag = "rgba(0, 0, 0, 0.8)";
				var beforehover = "#9e9e9e";
			}
			if (json.props) {
				if (json.props.TheDeskAccent) {
					var emphasized = json.props.TheDeskAccent
				} else {
					var emphasized = secondary;
				}
			} else {
				var emphasized = primary;
			}

			var css = ".customtheme {--bg:" + secondary + ";--drag:" + drag + ";" +
				"--color:" + text + ";--beforehover:" + beforehover + ";--modal:" +
				secondary + ";--subcolor:" + primary + ";--box:" + primary +
				";--sidebar:" + primary + ";--shared:" + emphasized + ";" +
				"--notfbox:" + secondary + ";--emphasized:" + primary + ";--his-data:" +
				secondary +
				";--active:" + primary + ";--postbox:" + primary + ";--modalfooter:" +
				primary +
				";}.blacktheme #imagemodal{background: url(\"../img/pixel.svg\");}";
			mainWindow.webContents.send('theme-css-response', css);
		} catch (e) {
			var css = "";
		}

	})
	ipc.on('theme-json-list', function(e, arg) {
		fs.readdir(app.getPath("userData"), function(err, files) {
			if (err) throw err;
			var fileList = files.filter(function(file) {
				var tfile = join(app.getPath("userData"), file);
				return fs.statSync(tfile).isFile() && /.*\.thedesktheme$/.test(tfile); //絞り込み
			})
			var themes = [];
			for (var i = 0; i < fileList.length; i++) {
				var themecss = join(app.getPath("userData"), fileList[i]);
				var json = JSON.parse(fs.readFileSync(themecss, 'utf8'));
				themes.push({
					name: json.name,
					id: json.id
				})
			}
			mainWindow.webContents.send('theme-json-list-response', themes);
		});
	})
}
exports.css = css;
