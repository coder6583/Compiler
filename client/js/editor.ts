// Socket.IO
const socket :SocketIOClient.Socket = io.connect('');

// CodeMirror
$(() => {
	// @ts-ignore
	const editor = CodeMirror(function(elt) {
		const editor = document.getElementById('editor');
		if (editor && editor.parentNode) editor.parentNode.replaceChild(elt, editor);
	}, {
		value: '',
		mode: "javascript",
		tabSize: 2,
		indentWithTabs: true,
		electricChars: true,
		styleActiveLine: true,
    lineNumbers: true,
    lineWrapping: true,
		matchBrackets: true,
		autoCloseBrackets: true,
		widget: '…',
		// @ts-ignore
    extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
    foldGutter: true,
		gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
	});
	// @ts-ignore
	editor.setOption('styleActiveLine', {nonEmpty: false});

	// ボタン
	$('#btn-load').on('click', loadProject);
	$('#btn-save').on('click', () => save(editor));
	$('#btn-compile').on('click', () => compile(editor));

	// リサイズ可能に
	$('.explorer').resizable({
		handleSelector: '.exp-spliter',
		resizeHeight: false
	});
	$('.editor-main').resizable({
		handleSelector: '.console-spliter',
		resizeWidth: false
	});

	// アカウントのステータス更新
	updateAccount();
});

// 変数
let editContents = new Map();
let editFileName = 'test.lang';
let projectName = 'Project1';
let account = {
	id: 'guest',
	name: 'ゲスト',
	avatar: ''
};

// ログ出力
function logConsole(value :string, style='log') {
	console.log(`${style}：${value}`);
	const outputArea = document.getElementById('editor-console');
	if (!outputArea) return;

	let output = document.createElement('div');
	output.classList.add(style);
	output.innerHTML = `<span class="output-value">${value}</span><span class="output-timestamp">${moment().format('HH:mm')}</span>`;
	outputArea.prepend(output);

	// スクロール
	outputArea.scrollTop = outputArea.scrollHeight;
}
// ポップアップメッセージ
function logPopup(value :string, style='info') {
	const outputArea = document.getElementById('popup-message');
	if (!outputArea) return;

	let output = document.createElement('div');
	output.classList.add('popup');
	output.classList.add(style);
	output.innerHTML = `<span>${value}</span><button><img src="./assets/icons/cross2.svg"></button>`;
	output.addEventListener('animationend', function(e) {
		if (e.animationName.startsWith('popup-end')) this.remove();
	});
	
	output.getElementsByTagName('button')[0].onclick = function() {
		output.getElementsByTagName('button')[0].parentElement?.classList.add('close');
	}
	outputArea.prepend(output);
}

// ログ出力
socket.on('output', (result :{value :string, style: 'log'|'err'|'info'}) => logConsole(result.value, result.style));

// 保存済み
socket.on('saved', (result :saveResult) => {
	// ログ
	logConsole(result.value, result.style);

	// ポップアップ
	logPopup(result.value, result.style);
});

// セーブ
function save(editor :CodeMirror.Editor) {
	const value = editor.getValue();
	
	// セーブ
	socket.emit('save', {
		projectName: projectName,
		filename: editFileName,
		value: value
	});
}

// コンパイル
function compile(editor :CodeMirror.Editor) {
	const value = editor.getValue();
	socket.emit('compile', {
		filename: editFileName,
		value: value
	});
}

// プロジェクトのロード
function loadProject() {
	socket.emit('loadProject', {
		projectName: 'test'
	});
}

// ファイルのロード
function loadFile() {
	socket.emit('loadProject', {
		projectName: 'test'
	});
}

// ロード完了 → ファイルツリーに反映
socket.on('loadedProject', (result :loadedProject) => {
	console.log(result);
	parseDir(result.value);

	// ログ
	logConsole('Project loaded');
});
function parseDir(dir :dirObject) {
	const tree = (root :Element, dir :dirObject, nest=0) => {
		if (!dir.value) return;
		dir.value.forEach(subdir => {
			let file = document.createElement('li');
			file.innerText = subdir.name;
			file.style.paddingLeft = `${nest * 20 + 30}px`;
			file.classList.add('ui-dir');
			if (subdir.type === 'folder') {
				file.classList.add('ui-folder');
				file.onclick = function() {
					file.classList.toggle('opened');
				}
			}
			if (subdir.type === 'file') file.classList.add('ui-file');
			root.appendChild(file);
			
			if (subdir.type === 'folder') {
				let folder = document.createElement('ul');
				folder.classList.add('ui-folder-root');
				root.appendChild(folder);
				tree(folder, subdir, nest + 1);
			}
		});
	}
	const root = document.querySelector('#exp-view > ul');
	if (!root) return;
	root.innerHTML = '';
	projectName = dir.name;
	tree(root, dir);
}

// ログインイベント
socket.on('login', (data :userData) => {
	console.log(data);
	account = data;
	updateAccount();
});

// アカウントのステータス更新
function updateAccount() {	
	// 名前
	$('#account-name').text(account.name);
	// アバター画像
	$('avatar-img').attr('src', account.avatar || 'assets/icons/guest.svg');
}
