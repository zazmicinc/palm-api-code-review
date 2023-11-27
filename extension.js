const vscode = require("vscode");
const FileUtils = require("./utils/FileUtils");
const CodeReview = require("./utils/CodeReview");

const funProgressTitles = [
  "Magic in the Making...",
  "Cracking the Code Eggs 🥚",
  "Weaving the Code Spells ✨",
  "Turning Code into Gold ✨",
  "Unleashing the Code Genie 🧞",
  "Flipping Code Pancakes 🥞",
  "Sculpting the Digital Clay 🎨",
  "Converting Pixels to Poems ✍️",
  "Cooking up Some Code Delights 🍳",
  "Transforming 1s and 0s 🌌",
];

async function generateCodeReviewFromFile(fileName, selectedText, endpoint) {
  const generatedCode = await CodeReview.codeReview(selectedText, endpoint);
  if (generatedCode === undefined) {
    return;
  }
  FileUtils.createReviewFile(fileName, generatedCode, endpoint);
}

async function generateCodeReviewFromEditor(endpoint) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return; // No open text editor
  }

  const selectedText = editor.document.getText();
  const fileName = editor.document.fileName;

  await generateCodeReviewFromFile(fileName, selectedText, endpoint);
  vscode.window.showInformationMessage(
      "Code review created successully!"
  );
}

async function generateCodeReviewFromFolder(context, uri, endpoint) {
  const files = await vscode.workspace.findFiles(new vscode.RelativePattern(uri.fsPath, "**/*.{js,ts,cpp,cs,go,java,kt,php,py,rb,rs,scala,swift}"));
  let isCreated = false;

  let counter =  10;
  let unlock = false;
  if(files.length >= counter) {
    unlock = await checkApiKey(context);
    if(unlock) {
      counter = 500;
    }
  }
  for (const file of files) {
    if(counter-- === 0) {
      vscode.window.showInformationMessage(`Restricted to ${unlock ? 500 : 10} files.`);
      break;
    }
    const fileUri = file.fsPath;
    if(!file.fsPath.includes(".md")) {
      const fileContent = (await vscode.workspace.fs.readFile(file)).toString();
      await generateCodeReviewFromFile(fileUri, fileContent, endpoint);
      isCreated = true;
    }
  }
  if(isCreated) {
    vscode.window.showInformationMessage(
      "Code review created successully!"
    );
  }
}

async function checkApiKey(context) {
  let apiKey = context.globalState.get('apiKey'); 

  if (!apiKey) {
    apiKey = await vscode.window.showInputBox({
      prompt: "Limited to 10 files. Please enter your promo code to unlock more or leave empty to continue.",
    });
  }

  if (apiKey) {
    const isValid = await validatePromoCode(apiKey);
    if (isValid == true) {
      context.globalState.update('apiKey', apiKey);
      return true;
    } else {
      vscode.window.showErrorMessage("Invalid promo code. Please try again or send a message to yuriy@zazmic.com to obtain one.");
      return false;
    }
  } else {
    return false;
  }

}

// Function to validate promo code (you need to implement the logic)
async function validatePromoCode(apiKey) {
  return apiKey === "***";
}

function registerCommandWithProgress(context, commandId) {
  return vscode.commands.registerCommand(commandId, async (uri) => {
    console.log("Command called: ", commandId);

    const randomTitleIndex = Math.floor(
      Math.random() * funProgressTitles.length
    );
    const randomTitle = funProgressTitles[randomTitleIndex];

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: randomTitle,
        cancellable: true,
      },
      async () => {
        switch (commandId) {
          case "palm-api-code-review.BasicCodeReview":
            await generateCodeReviewFromEditor("review");
            break;
          case "palm-api-code-review.SecurityIssues":
            await generateCodeReviewFromEditor("security");
            break;
          case "palm-api-code-review.BugsHunting":
            await generateCodeReviewFromEditor("bugs");
            break;
          case "palm-api-code-review.BasicCodeReviewFolder":
            await generateCodeReviewFromFolder(context, uri, "review");
            break;
          case "palm-api-code-review.SecurityIssuesFolder":
            await generateCodeReviewFromFolder(context, uri, "security");
            break;
          case "palm-api-code-review.BugsHuntingFolder":
            await generateCodeReviewFromFolder(context, uri, "bugs");
            break;
          default:
            break;
        }
    });
  });
}

function activate(context) {
  const commands = [
      { id: "palm-api-code-review.BasicCodeReview" },
      { id: "palm-api-code-review.SecurityIssues" },
      { id: "palm-api-code-review.BugsHunting"},
      { id: "palm-api-code-review.BasicCodeReviewFolder" },
      { id: "palm-api-code-review.SecurityIssuesFolder" },
      { id: "palm-api-code-review.BugsHuntingFolder"},
  ];

  commands.forEach(({ id }) => {
    console.log("Registering command: ", id);
    let disposable = registerCommandWithProgress(context, id);
    context.subscriptions.push(disposable);
  });
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
