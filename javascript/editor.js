// Socket.IO
const socket = io.connect('');

const editor = CodeMirror(function(elt) {
	const editor = document.getElementById('editor-editbox');
	editor.parentNode.replaceChild(elt, editor);
}, {
  value: '',
	mode: "javascript",
	matchBrackets: true,
	tabSize: 2,
	indentWithTabs: true,
	electricChars: true,
	lineNumbers: true,
	styleActiveLine: true
});
editor.setOption('styleActiveLine', {nonEmpty: false});

// コンパイル
function compile() {
	const value = editor.getValue();
	socket.emit('compile', value);
}

socket.on('output', result => {
	if (result.success) {
		console.log(result.value);
	}else {
		console.error(result.value);
	}
})

// イベント登録
document.getElementById('editor-button-compile').onclick = compile;
