const tokenButtons = [...document.querySelectorAll("[data-token]")];
const scenarioButtons = [...document.querySelectorAll("[data-scenario]")];
const attentionPaths = document.querySelector("#attention-paths");
const attentionSummary = document.querySelector("#attention-summary");

// Hand-authored, normalized examples for teaching; these are not model outputs.
const teachingWeights = [
  [0.08, 0.06, 0.22, 0.1, 0.05, 0.36, 0.13],
  [0.25, 0.05, 0.45, 0.1, 0.04, 0.05, 0.06],
  [0.39, 0.07, 0.05, 0.3, 0.05, 0.04, 0.1],
  [0.1, 0.06, 0.48, 0.06, 0.07, 0.08, 0.15],
  [0.15, 0.05, 0.1, 0.09, 0.04, 0.17, 0.4],
  [0.6, 0.03, 0.04, 0.09, 0.04, 0.05, 0.15],
  [0.36, 0.02, 0.04, 0.1, 0.08, 0.34, 0.06],
];
const wideContextWeights = {
  5: [0.08, 0.03, 0.04, 0.6, 0.04, 0.05, 0.16],
  6: [0.06, 0.03, 0.05, 0.45, 0.08, 0.27, 0.06],
};
let selectedToken = 5;
let scenario = "tired";

function renderAttention() {
  const words = [
    "小猫",
    "没有",
    "过",
    "马路",
    "因为",
    "它",
    scenario === "tired" ? "太累了" : "太宽了",
  ];
  const weights =
    scenario === "wide" && wideContextWeights[selectedToken]
      ? wideContextWeights[selectedToken]
      : teachingWeights[selectedToken];
  const strongest = weights.indexOf(Math.max(...weights));
  const paths = document.createDocumentFragment();

  tokenButtons.forEach((button, index) => {
    const selected = index === selectedToken;
    button.classList.toggle("is-selected", selected);
    button.classList.toggle("is-related", index === strongest && !selected);
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute(
      "aria-label",
      `${words[index]}，示意关注权重 ${Math.round(weights[index] * 100)}%${selected ? "，当前选中的词" : ""}`,
    );
    button.querySelector(".token-word").textContent = words[index];
    button.querySelector(".weight-track > span").style.width =
      `${weights[index] * 100}%`;
    if (selected) return;

    const from = selectedToken * 100 + 50;
    const to = index * 100 + 50;
    const height = Math.max(7, 172 - Math.abs(selectedToken - index) * 26);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      `M ${from} 210 C ${from} ${height}, ${to} ${height}, ${to} 210`,
    );
    path.setAttribute("stroke-width", String(0.9 + weights[index] * 7));
    path.setAttribute(
      "opacity",
      index === strongest ? "0.9" : String(0.19 + weights[index]),
    );
    if (index === strongest) path.style.stroke = "var(--c1)";
    paths.append(path);
  });
  attentionPaths.replaceChildren(paths);
  const queryWord = document.createElement("strong");
  queryWord.textContent = words[selectedToken];
  const relatedWord = document.createElement("em");
  relatedWord.textContent = words[strongest];
  attentionSummary.replaceChildren(
    "读到「",
    queryWord,
    "」，多看一眼「",
    relatedWord,
    "」。",
  );

  scenarioButtons.forEach((button) => {
    const active = button.dataset.scenario === scenario;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

tokenButtons.forEach((button) =>
  button.addEventListener("click", () => {
    selectedToken = Number(button.dataset.token);
    renderAttention();
  }),
);
scenarioButtons.forEach((button) =>
  button.addEventListener("click", () => {
    scenario = button.dataset.scenario;
    renderAttention();
  }),
);
renderAttention();

const swapButton = document.querySelector("#swap-order");
let orderSwapped = false;
swapButton.setAttribute("aria-pressed", "false");
swapButton.addEventListener("click", () => {
  orderSwapped = !orderSwapped;
  document.querySelector("#position-first").textContent = orderSwapped
    ? "你"
    : "我";
  document.querySelector("#position-last").textContent = orderSwapped
    ? "我"
    : "你";
  document.querySelector("#position-result").textContent = orderSwapped
    ? "现在是「你爱我」：词换了位置，含义也随之改变。"
    : "现在是「我爱你」：位置编码帮助模型分清「谁爱谁」。";
  swapButton.setAttribute("aria-pressed", String(orderSwapped));
});

const outputWords = ["猫", "坐", "在", "垫子", "上", "。"];
const generateButton = document.querySelector("#generate-next");
const generatedSentence = document.querySelector("#generated-sentence");
const generationStep = document.querySelector("#generation-step");
let generatedCount = 0;

generateButton.addEventListener("click", () => {
  if (generatedCount === outputWords.length) {
    generatedCount = 0;
    const placeholder = document.createElement("span");
    placeholder.className = "generation-placeholder";
    placeholder.textContent = "从一个起始标记开始……";
    generatedSentence.replaceChildren(placeholder);
    generateButton.firstChild.textContent = "生成下一个词 ";
    generateButton.querySelector("use").setAttribute("href", "#i-arrow");
  } else {
    if (generatedCount === 0) generatedSentence.replaceChildren();
    const word = document.createElement("span");
    word.className = "generated-word";
    word.textContent = outputWords[generatedCount];
    generatedSentence.append(word);
    generatedCount += 1;
    if (generatedCount === outputWords.length) {
      generateButton.firstChild.textContent = "重新演示 ";
      generateButton.querySelector("use").setAttribute("href", "#i-refresh");
    }
  }
  generationStep.textContent = `${generatedCount} / ${outputWords.length}${generatedCount === outputWords.length ? " · 完成" : ""}`;
});

const quizOptions = [...document.querySelectorAll(".quiz-option")];
const quizFeedback = document.querySelector("#quiz-feedback");
quizOptions.forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    const correct = button.dataset.correct === "true";
    quizOptions.forEach((option) => {
      option.classList.remove("correct", "incorrect");
      option.setAttribute("aria-pressed", String(option === button));
    });
    button.classList.add(correct ? "correct" : "incorrect");
    quizFeedback.classList.toggle("success", correct);
    quizFeedback.textContent = correct
      ? "没错！根据上下文分配权重，再把相关信息汇合起来。"
      : "再想一想：注意力不是死记或只看末尾，而是决定“该多关注谁”。";
  });
});

const menuButton = document.querySelector(".mobile-menu");
const sidebar = document.querySelector("#chapter-nav");
function closeMenu() {
  sidebar.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "展开章节目录");
}
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  sidebar.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "收起章节目录" : "展开章节目录");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!sidebar.contains(event.target) && !menuButton.contains(event.target))
    closeMenu();
});

const crossBridge = document.querySelector(".cross-bridge");
const crossBridgeSvg = crossBridge.querySelector("svg");
const crossBridgePath = crossBridge.querySelector("path");
const crossBridgeLabel = crossBridge.querySelector("span");
const encoderOutput = document.querySelector(".model-column:first-child .model-output");
const decoderCrossAttention = document.querySelector(".cross-attention");

// Keep the arrow attached to the actual cross-attention block at every width.
function positionCrossAttentionLink() {
  const bridgeBox = crossBridge.getBoundingClientRect();
  const sourceBox = encoderOutput.getBoundingClientRect();
  const targetBox = decoderCrossAttention.getBoundingClientRect();
  const sourceY = sourceBox.top + sourceBox.height / 2 - bridgeBox.top;
  const targetY = targetBox.top + targetBox.height / 2 - bridgeBox.top;
  const midpoint = bridgeBox.width / 2;
  const end = bridgeBox.width - 1;
  const arrowSize = Math.min(6, bridgeBox.width / 5);
  crossBridgeSvg.setAttribute("viewBox", `0 0 ${bridgeBox.width} ${bridgeBox.height}`);
  crossBridgePath.setAttribute(
    "d",
    `M0 ${sourceY} H${midpoint} V${targetY} H${end} m-${arrowSize} -${arrowSize} ${arrowSize} ${arrowSize} -${arrowSize} ${arrowSize}`,
  );
  crossBridgeLabel.style.top = `${(sourceY + targetY - crossBridgeLabel.offsetHeight) / 2}px`;
}
new ResizeObserver(positionCrossAttentionLink).observe(crossBridge);

const chapterLinks = [...document.querySelectorAll(".chapter-link")];
const chapters = chapterLinks.map((link) =>
  document.querySelector(link.getAttribute("href")),
);
const progressFill = document.querySelector("#progress-fill");
const progressValue = document.querySelector("#progress-value");
const topProgress = document.querySelector("#top-progress-bar");
const backToTop = document.querySelector("#back-to-top");
chapterLinks.forEach((link) => link.addEventListener("click", closeMenu));
backToTop.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "auto" }),
);
let scrollFrame = 0;
let currentChapter = 0;
function updateReadingState() {
  scrollFrame = 0;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress =
    scrollable > 0
      ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100))
      : 100;
  const width = `${progress.toFixed(1)}%`;
  progressFill.style.width = width;
  topProgress.style.width = width;
  progressValue.textContent = `${Math.round(progress)}%`;
  backToTop.hidden = window.scrollY < 600;
  let active = 0;
  chapters.forEach((chapter, index) => {
    if (
      chapter.getBoundingClientRect().top <=
      Math.max(160, window.innerHeight * 0.35)
    )
      active = index;
  });
  if (active !== currentChapter) {
    chapterLinks.forEach((link, index) => {
      link.classList.toggle("is-active", index === active);
      if (index === active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    currentChapter = active;
  }
}
function scheduleReadingState() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateReadingState);
}
window.addEventListener("scroll", scheduleReadingState, { passive: true });
window.addEventListener(
  "resize",
  () => {
    if (window.innerWidth > 800) closeMenu();
    scheduleReadingState();
  },
  { passive: true },
);
document
  .querySelector(".deeper-dive")
  .addEventListener("toggle", scheduleReadingState);
window.addEventListener("load", scheduleReadingState, { once: true });
updateReadingState();
