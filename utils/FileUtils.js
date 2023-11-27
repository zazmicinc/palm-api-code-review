const vscode = require("vscode");
const fs = require("fs");
const path = require('path');


async function createDirectory(dirPath) {
  fs.mkdir(dirPath, { recursive: true }, () => { });
}

async function createReviewFile(name, content, endpoint) {
  const wsedit = new vscode.WorkspaceEdit();
  const pathInfo = path.parse(name);
  
  await createDirectory(pathInfo.dir + "/review");
  const filePath = vscode.Uri.file(pathInfo.dir + `/review/${pathInfo.name}${pathInfo.ext}.${endpoint}.md`);
  wsedit.createFile(filePath, { ignoreIfExists: true });
  
  vscode.workspace.applyEdit(wsedit);

  try {
    fs.writeFileSync(filePath.fsPath, content, { flag: "w" });
  } catch (error) {
    vscode.window.showErrorMessage("Error writing to file: " + error.message);
  }
}

module.exports = {
  createReviewFile,
};
