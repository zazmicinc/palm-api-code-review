const vscode = require("vscode");
const FileUtils = require("./utils/FileUtils");
const CodeGenerator = require("./utils/CodeGenerator");

async function generateCodeReviewFromFile(fileName, selectedText) {
  const generatedCode = await CodeGenerator.generateCodeReview(selectedText);
  if (generatedCode === undefined) {
    return;
  }
  FileUtils.createReviewFile(fileName, generatedCode);
}

async function generateCodeReviewFromEditor() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return; // No open text editor
  }

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);
  const fileName = editor.document.fileName;

  await generateCodeReviewFromFile(fileName, selectedText);
}

function activate(context) {
  const disposable = vscode.commands.registerCommand("palm-api-code-review.GenerateCode", async () => {

    return new Promise((resolve) => {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Initiating Code Review...",
          cancellable: true,
        },
        async (progress, token) => {
          await generateCodeReviewFromEditor();
          resolve();
        }
      );
    });
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
