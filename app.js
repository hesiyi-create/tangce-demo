(function () {
  "use strict";

  const DATA = window.APP_DATA;
  if (!DATA) {
    throw new Error("应用数据未加载");
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const formatNumber = (value) => new Intl.NumberFormat("zh-CN").format(value);
  const formatPercent = (value, digits = 1) =>
    `${(Number(value) * 100).toFixed(digits)}%`;
  const toISODate = (value) => {
    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  };
  const todayISO = () => toISODate(new Date());
  const formatDateTime = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
  };
  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const pageMeta = {
    risk: {
      eyebrow: "全国社区模型 · 居民糖尿病风险自测",
      title: "家庭健康风险画像"
    },
    screening: {
      eyebrow: "全国社区端 · 固定容量筛查",
      title: "社区筛查优先级与公平审计"
    },
    review: {
      eyebrow: "武汉市医保经办端 · 糖尿病单病种",
      title: "门诊慢特病材料辅助预审"
    },
    policy: {
      eyebrow: "政策规则 · 模型边界",
      title: "武汉市糖尿病门诊慢特病依据"
    }
  };

  const roleConfig = {
    resident: {
      name: "普通居民",
      chip: "居民健康自测",
      firstView: "risk",
      allowedViews: ["risk"],
      rippleColor: "#4b8a62"
    },
    community: {
      name: "社区健康管理工作者",
      chip: "社区筛查工作台",
      firstView: "screening",
      allowedViews: ["screening"],
      rippleColor: "#2f7c80"
    },
    insurance: {
      name: "医保办经办人员",
      chip: "武汉医保经办预审",
      firstView: "review",
      allowedViews: ["review", "policy"],
      rippleColor: "#bd8b33"
    }
  };

  const featureLabelMap = Object.fromEntries(
    DATA.model.coefficients.map((item) => [item.variable, item.label])
  );

  const formFields = {
    profileName: $("#profileName"),
    province: $("#province"),
    age: $("#age"),
    sex: $("#sex"),
    residence: $("#residence"),
    managementStatus: $("#managementStatus"),
    bmi: $("#bmi"),
    waistHeight: $("#waistHeight"),
    calf: $("#calf"),
    education: $("#education"),
    systolic: $("#systolic"),
    diastolic: $("#diastolic"),
    selfHealth: $("#selfHealth"),
    smoking: $("#smoking"),
    packYears: $("#packYears"),
    drinking: $("#drinking"),
    alcoholWeek: $("#alcoholWeek"),
    passiveSmoke: $("#passiveSmoke"),
    sugarFreq: $("#sugarFreq"),
    preservedVeg: $("#preservedVeg"),
    exercise: $("#exercise"),
    hypertension: $("#hypertension"),
    lowFruit: $("#lowFruit"),
    lowVegetable: $("#lowVegetable"),
    adl: $("#adl")
  };
  const modelFeatureMean = (variable) =>
    DATA.model.coefficients.find((item) => item.variable === variable)?.mean || 0;
  const NATIONAL_CONTEXT = {
    pm25_2014: modelFeatureMean("pm25_2014"),
    log_income_2014: modelFeatureMean("log_income_2014"),
    log_gdp_2014: modelFeatureMean("log_gdp_2014")
  };
  const PROVINCE_CONTEXTS = {
    上海市: { pm25_2014: 3.1253606431, log_income_2014: 10.7356790267, log_gdp_2014: 10.1645240128 },
    北京市: { pm25_2014: 4.9641165576, log_income_2014: 10.7030197238, log_gdp_2014: 10.0680905588 },
    吉林省: { pm25_2014: 2.0751856198, log_income_2014: 9.7711554405, log_gdp_2014: 9.2181101092 },
    四川省: { pm25_2014: 4.3836858636, log_income_2014: 9.6645956443, log_gdp_2014: 10.2873373915 },
    天津市: { pm25_2014: 4.6402536943, log_income_2014: 10.2692758435, log_gdp_2014: 9.282679638 },
    安徽省: { pm25_2014: 4.4955501261, log_income_2014: 9.728955578, log_gdp_2014: 10.0380927434 },
    山东省: { pm25_2014: 4.5264146075, log_income_2014: 9.945828393, log_gdp_2014: 10.8503792618 },
    山西省: { pm25_2014: 8.3934511812, log_income_2014: 9.7134765073, log_gdp_2014: 9.4180047364 },
    广东省: { pm25_2014: 2.3963162461, log_income_2014: 10.1537013754, log_gdp_2014: 11.1504393833 },
    广西壮族自治区: { pm25_2014: 3.2576813962, log_income_2014: 9.6523302548, log_gdp_2014: 9.5365963138 },
    江苏省: { pm25_2014: 3.8260841137, log_income_2014: 10.2100159128, log_gdp_2014: 11.1008782422 },
    江西省: { pm25_2014: 3.5671895921, log_income_2014: 9.7252576136, log_gdp_2014: 9.6715302742 },
    河北省: { pm25_2014: 5.2486036095, log_income_2014: 9.7200453681, log_gdp_2014: 10.1521077992 },
    河南省: { pm25_2014: 6.842800861, log_income_2014: 9.6611611818, log_gdp_2014: 10.4519615001 },
    浙江省: { pm25_2014: 2.9815732569, log_income_2014: 10.3938757476, log_gdp_2014: 10.615090866 },
    海南省: { pm25_2014: 1.438757632, log_income_2014: 9.7686410098, log_gdp_2014: 8.172503282 },
    湖北省: { pm25_2014: 6.0506856182, log_income_2014: 9.8137816395, log_gdp_2014: 10.2683702208 },
    湖南省: { pm25_2014: 4.8042644464, log_income_2014: 9.7769601461, log_gdp_2014: 10.1777081749 },
    福建省: { pm25_2014: 2.2720912272, log_income_2014: 10.0575810879, log_gdp_2014: 10.1397605344 },
    辽宁省: { pm25_2014: 2.7637651515, log_income_2014: 10.0354364437, log_gdp_2014: 9.9224319685 },
    重庆市: { pm25_2014: 5.6249043808, log_income_2014: 9.8175483279, log_gdp_2014: 9.6099684779 },
    陕西省: { pm25_2014: 10.6267411231, log_income_2014: 9.6701673948, log_gdp_2014: 9.7777315672 },
    黑龙江省: { pm25_2014: 1.5524820152, log_income_2014: 9.7645128002, log_gdp_2014: 9.4220669975 }
  };
  const adlItemFields = $$('input[name="adlItem"]');
  const adlLabelMap = Object.fromEntries(
    adlItemFields.map((input) => [
      input.value,
      input.closest(".adl-item")?.querySelector("strong")?.textContent.trim() ||
        input.value
    ])
  );
  const residentMacroVariables = new Set([
    "pm25_2014",
    "log_income_2014",
    "log_gdp_2014"
  ]);
  const residentRecordStorageKey = "tangce-resident-records-v1";
  const residentRecordLimit = 40;

  let toastTimer;
  let currentAssessment = null;
  let activeRole = null;
  let communityCases = [];
  let communityCaseSeq = 0;
  let screeningState = {
    capacity: 0.2,
    group: "all",
    strategy: "logit"
  };
  let activeCaseId = null;
  let reviewSeq = 0;
  let policyExtraSources = [];
  let policyNotices = [];
  const IMPORTED_REVIEW_STORAGE_KEY = "tangce.imported.review.cases.v1";
  const POLICY_CONTENT_STORAGE_KEY = "tangce.policy.applied-content.v1";
  const COMMUNITY_CASES_STORAGE_KEY = "tangce.community.cases.v1";

  const reviewCases = [
    {
      id: "TC-2601",
      name: "王*梅",
      age: 78,
      sex: "女",
      disease: "糖尿病",
      status: "待补正",
      statusLevel: "red",
      priority: 96,
      deadline: "2026-11-15",
      submitted: "2026-11-11",
      institution: "青山区某社区卫生服务中心",
      appointment: "2026-11-18 09:00",
      docs: [
        ["身份与参保凭证", "已读取", "ok"],
        ["糖尿病诊断证明", "已读取", "ok"],
        ["近两年病历或出院记录", "已读取", "ok"],
        ["符合准入标准的佐证", "缺少眼底或神经检查材料", "bad"],
        ["拟就诊机构信息", "已填写", "ok"],
        ["联系电话", "已填写", "ok"]
      ],
      issues: ["缺少至少一类准入标准对应的检查或病史佐证", "建议补充眼底检查或神经电生理报告"],
      notes: "系统仅提示材料可能不完整，不判断医学诊断是否成立。"
    },
    {
      id: "TC-2602",
      name: "李*国",
      age: 72,
      sex: "男",
      disease: "糖尿病",
      status: "材料齐全",
      statusLevel: "green",
      priority: 88,
      deadline: "2026-11-20",
      submitted: "2026-11-12",
      institution: "武汉市某三级医院",
      appointment: "2026-11-19 14:30",
      docs: [
        ["身份与参保凭证", "已读取", "ok"],
        ["糖尿病诊断证明", "已读取", "ok"],
        ["近两年病历或出院记录", "已读取", "ok"],
        ["符合准入标准的佐证", "糖尿病视网膜病变II期报告已上传", "ok"],
        ["拟就诊机构信息", "已填写", "ok"],
        ["联系电话", "已填写", "ok"]
      ],
      issues: [],
      notes: "材料清单完整，仍需由指定医疗机构和医保经办人员进行医学与资格审核。"
    },
    {
      id: "TC-2603",
      name: "周*珍",
      age: 81,
      sex: "女",
      disease: "糖尿病",
      status: "信息冲突",
      statusLevel: "amber",
      priority: 91,
      deadline: "2026-11-14",
      submitted: "2026-11-10",
      institution: "青山区某二级医院",
      appointment: "2026-11-17 10:30",
      docs: [
        ["身份与参保凭证", "已读取", "ok"],
        ["糖尿病诊断证明", "已读取", "ok"],
        ["近两年病历或出院记录", "日期与检查报告不一致", "warn"],
        ["符合准入标准的佐证", "已上传，需核对时间", "warn"],
        ["拟就诊机构信息", "已填写", "ok"],
        ["联系电话", "已填写", "ok"]
      ],
      issues: ["门诊病历日期晚于检查报告日期", "需人工核对材料先后关系及诊断时间"],
      notes: "系统检测到字段关系异常，应核对原件，不应自动退回或自动通过。"
    },
    {
      id: "TC-2604",
      name: "陈*生",
      age: 68,
      sex: "男",
      disease: "糖尿病",
      status: "预约过期",
      statusLevel: "amber",
      priority: 76,
      deadline: "2026-11-22",
      submitted: "2026-11-04",
      institution: "武汉市某三级医院",
      appointment: "2026-11-08 15:00",
      docs: [
        ["身份与参保凭证", "已读取", "ok"],
        ["糖尿病诊断证明", "已读取", "ok"],
        ["近两年病历或出院记录", "已读取", "ok"],
        ["符合准入标准的佐证", "已读取", "ok"],
        ["拟就诊机构信息", "已填写", "ok"],
        ["联系电话", "已填写", "ok"]
      ],
      issues: ["原预约时间已过期", "建议重新预约并发送到场材料提醒"],
      notes: "预约过期不等于材料失效，应提供重新预约和代办指引。"
    },
    {
      id: "TC-2605",
      name: "赵*兰",
      age: 85,
      sex: "女",
      disease: "糖尿病",
      status: "临近复审",
      statusLevel: "red",
      priority: 84,
      deadline: "2026-12-31",
      submitted: "2026-11-09",
      institution: "青山区某社区卫生服务中心",
      appointment: "无需现场鉴定",
      docs: [
        ["身份与参保凭证", "已读取", "ok"],
        ["门诊病历", "近一年记录已读取", "ok"],
        ["检验检查报告", "已读取", "ok"],
        ["用药记录", "已读取", "ok"],
        ["复审期限", "距截止约48天", "warn"],
        ["联系方式", "已填写", "ok"]
      ],
      issues: ["证件将于复审截止前进入提醒窗口", "建议发送线上复审和帮代办提示"],
      notes: "糖尿病复审周期为5年；历史存量业务的具体截止日以医保局通知为准。"
    },
    {
      id: "TC-2606",
      name: "刘*平",
      age: 75,
      sex: "男",
      disease: "糖尿病",
      status: "需人工核验",
      statusLevel: "amber",
      priority: 70,
      deadline: "2026-11-25",
      submitted: "2026-11-12",
      institution: "武汉市某三级医院",
      appointment: "2026-11-21 08:30",
      docs: [
        ["身份与参保凭证", "已读取", "ok"],
        ["糖尿病诊断证明", "病种名称表述不一致", "warn"],
        ["近两年病历或出院记录", "已读取", "ok"],
        ["符合准入标准的佐证", "已读取", "ok"],
        ["拟就诊机构信息", "已填写", "ok"],
        ["联系电话", "已填写", "ok"]
      ],
      issues: ["申请病种与诊断证明文字表述不一致", "需人工判断是否属于同一病种"],
      notes: "文字不一致不能直接视为虚假材料，应交由人工核验前后文和原件。"
    }
  ];

  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          "stroke-width": 1.8,
          "aria-hidden": "true"
        }
      });
    }
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  function applyRoleInterface(roleName) {
    const config = roleConfig[roleName];
    if (!config) return;
    document.body.dataset.role = roleName;
    $("#activeRoleName").textContent = config.name;
    $("#roleChipText").textContent = config.chip;
    $$(".nav-item").forEach((button) => {
      button.hidden = !config.allowedViews.includes(button.dataset.view);
    });
    const infoButton = $("#policyInfoButton");
    infoButton.hidden = roleName !== "insurance";
    infoButton.title = "查看政策与模型说明";
    setView(config.firstView);
  }

  function showRoleGate() {
    activeRole = null;
    const roleGate = $("#roleGate");
    const appShell = $("#appShell");
    roleGate.hidden = false;
    roleGate.classList.remove("is-leaving");
    document.body.classList.add("role-locked");
    document.body.classList.remove("is-role-entered");
    delete document.body.dataset.role;
    appShell.inert = true;
    appShell.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      $(".role-option")?.focus({ preventScroll: true });
    }, 80);
  }

  function enterRole(roleName, sourceButton, event) {
    const config = roleConfig[roleName];
    if (!config) return;
    const roleGate = $("#roleGate");
    const appShell = $("#appShell");
    const ripple = $("#roleRipple");
    const rect = sourceButton.getBoundingClientRect();
    const x = event?.detail ? event.clientX : rect.left + rect.width / 2;
    const y = event?.detail ? event.clientY : rect.top + rect.height / 2;
    const maxDistance = Math.max(
      Math.hypot(x, y),
      Math.hypot(window.innerWidth - x, y),
      Math.hypot(x, window.innerHeight - y),
      Math.hypot(window.innerWidth - x, window.innerHeight - y)
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    activeRole = roleName;
    applyRoleInterface(roleName);
    appShell.inert = false;
    appShell.removeAttribute("aria-hidden");

    ripple.style.setProperty("--ripple-x", `${x}px`);
    ripple.style.setProperty("--ripple-y", `${y}px`);
    ripple.style.setProperty("--ripple-color", config.rippleColor);
    ripple.style.setProperty("--ripple-scale", String(Math.ceil(maxDistance / 12) + 2));
    ripple.classList.remove("is-active");
    void ripple.offsetWidth;
    ripple.classList.add("is-active");

    if (reduceMotion) {
      document.body.classList.remove("role-locked");
      document.body.classList.add("is-role-entered");
      roleGate.hidden = true;
      ripple.classList.remove("is-active");
      $("#pageTitle")?.focus?.({ preventScroll: true });
      return;
    }

    window.setTimeout(() => {
      document.body.classList.remove("role-locked");
      document.body.classList.add("is-role-entered");
    }, 180);
    window.setTimeout(() => roleGate.classList.add("is-leaving"), 500);
    window.setTimeout(() => {
      roleGate.hidden = true;
      roleGate.classList.remove("is-leaving");
      ripple.classList.remove("is-active");
      document.querySelector("#pageTitle")?.setAttribute("tabindex", "-1");
      document.querySelector("#pageTitle")?.focus({ preventScroll: true });
    }, 920);
  }

  function setView(viewName) {
    if (
      activeRole &&
      roleConfig[activeRole] &&
      !roleConfig[activeRole].allowedViews.includes(viewName)
    ) {
      return;
    }
    $$(".view").forEach((view) => {
      view.classList.toggle("is-active", view.id === `view-${viewName}`);
    });
    $$(".nav-item").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.view === viewName);
    });
    const meta = pageMeta[viewName];
    if (meta) {
      $("#pageEyebrow").textContent = meta.eyebrow;
      $("#pageTitle").textContent = meta.title;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    refreshIcons();
  }

  function getInputModel() {
    const systolic = Number(formFields.systolic.value);
    const diastolic = Number(formFields.diastolic.value);
    const pulsePressure = clamp(systolic - diastolic, 10, 150);
    const residence = formFields.residence.value;
    const smoking = formFields.smoking.value;
    const drinking = formFields.drinking.value;
    const packYears = Number(formFields.packYears.value) || 0;
    const alcoholWeek = Number(formFields.alcoholWeek.value) || 0;
    const province = formFields.province.value;
    const provinceContext = PROVINCE_CONTEXTS[province] || NATIONAL_CONTEXT;

    return {
      age: Number(formFields.age.value),
      male: Number(formFields.sex.value),
      city: residence === "city" ? 1 : 0,
      town: residence === "town" ? 1 : 0,
      current_smoke: smoking === "current" ? 1 : 0,
      log_pack_years: Math.log1p(packYears),
      passive_smoke_count: Number(formFields.passiveSmoke.value),
      current_drink: drinking === "current" ? 1 : 0,
      log_alcohol_g_week: Math.log1p(alcoholWeek),
      exercise: formFields.exercise.checked ? 1 : 0,
      hypertension: formFields.hypertension.checked ? 1 : 0,
      self_health: Number(formFields.selfHealth.value),
      education_years: Number(formFields.education.value),
      bmi: Number(formFields.bmi.value),
      waist_height_ratio: Number(formFields.waistHeight.value),
      calf: Number(formFields.calf.value),
      pulse_pressure: pulsePressure,
      adl_limitations: Number(formFields.adl.value),
      low_fruit: formFields.lowFruit.checked ? 1 : 0,
      low_vegetable: formFields.lowVegetable.checked ? 1 : 0,
      preserved_vegetable_freq: Number(formFields.preservedVeg.value),
      sugar_freq: Number(formFields.sugarFreq.value),
      tea_freq: 3.87,
      pm25_2014: provinceContext.pm25_2014,
      log_income_2014: provinceContext.log_income_2014,
      log_gdp_2014: provinceContext.log_gdp_2014,
      province
    };
  }

  function updateProvinceContextNote() {
    const note = $("#provinceContextNote");
    if (!note) return;
    const province = formFields.province.value;
    const matched = Boolean(PROVINCE_CONTEXTS[province]);
    note.classList.toggle("is-fallback", Boolean(province) && !matched);
    if (!province) {
      note.textContent =
        "当前模型支持到省级。选择省份后会按当地人群背景校正风险排序；城市级定位暂不开放，避免假精度。";
    } else if (matched) {
      note.textContent = `已按${province}的省级队列背景校正；当前不支持城市级假精度，地区背景也不代表个人环境暴露。`;
    } else {
      note.textContent =
        "该省份暂未包含在原 CLHLS 建模队列中，当前先按全国平均背景计算；城市级定位同样需要后续补齐市级数据。";
    }
  }

  function getRiskIndex(probability) {
    const sorted = DATA.cohort.map((row) => row.predicted_logit).sort((a, b) => a - b);
    const lowerBound = (target) => {
      let low = 0;
      let high = sorted.length;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (sorted[mid] < target) low = mid + 1;
        else high = mid;
      }
      return low;
    };
    const upperBound = (target) => {
      let low = 0;
      let high = sorted.length;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (sorted[mid] <= target) low = mid + 1;
        else high = mid;
      }
      return low;
    };
    const less = lowerBound(probability);
    const equal = upperBound(probability) - less;
    return Math.round(((less + equal * 0.5) / sorted.length) * 100);
  }

  function calculateAssessment() {
    const input = getInputModel();
    const details = DATA.model.coefficients.map((feature) => {
      const raw = input[feature.variable] ?? feature.mean;
      const z = (raw - feature.mean) / (feature.sd || 1);
      return {
        variable: feature.variable,
        label: featureLabelMap[feature.variable] || feature.variable,
        coefficient: feature.coefficient,
        contribution: feature.coefficient * z,
        value: raw
      };
    });
    const linearPredictor =
      DATA.model.intercept +
      details.reduce((sum, feature) => sum + feature.contribution, 0);
    const probability = 1 / (1 + Math.exp(-linearPredictor));
    const riskIndex = getRiskIndex(probability);
    const contributors = [...details].sort(
      (a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)
    );

    currentAssessment = {
      input,
      details,
      contributors,
      probability,
      riskIndex,
      band: riskIndex >= 80 ? "high" : riskIndex >= 50 ? "medium" : "low",
      managementStatus: formFields.managementStatus.value,
      province: input.province,
      generatedAt: new Date()
    };
    renderAssessment();
    return currentAssessment;
  }

  function buildActions() {
    const input = currentAssessment.input;
    const status = currentAssessment.managementStatus;
    const actions = [];

    if (status === "unknown" && currentAssessment.riskIndex >= 80) {
      actions.push({
        icon: "stethoscope",
        text: "建议社区复核并转诊，完成空腹血糖和糖化血红蛋白等检查。"
      });
    }
    if (status === "diagnosed") {
      actions.push({
        icon: "file-check-2",
        text: "如尚未申请门诊慢特病，可携带诊断证明和病历向医保经办机构咨询；系统不会自动认定待遇资格。"
      });
    }
    if (status === "pending") {
      actions.push({
        icon: "clipboard-list",
        text: "按医保经办反馈补齐近期病历、检查和诊断材料；保存本页记录，便于下次办理时核对。"
      });
    }
    if (status === "enrolled") {
      actions.push({
        icon: "calendar-clock",
        text: "核对待遇有效期、定点机构和复审提醒，糖尿病复审周期为5年。"
      });
    }
    if (input.current_smoke) {
      actions.push({
        icon: "cigarette-off",
        text: "建议转介戒烟服务，记录吸烟包年数并安排随访。"
      });
    }
    if (input.log_alcohol_g_week > Math.log1p(100)) {
      actions.push({
        icon: "glass-water",
        text: "询问饮酒频率和酒类，建议控制饮酒并筛查相关代谢风险。"
      });
    }
    if (input.waist_height_ratio >= 0.5 || input.bmi >= 24) {
      actions.push({
        icon: "scale",
        text: "记录腰围、体重和BMI，提供体重与腰围管理建议。"
      });
    }
    if (input.low_fruit || input.low_vegetable) {
      actions.push({
        icon: "apple",
        text: "结合可及性提供蔬果摄入建议，不使用责备性表述。"
      });
    }
    if (!input.exercise) {
      actions.push({
        icon: "footprints",
        text: "评估行动能力后提供可执行的步行或家庭活动建议。"
      });
    }
    if (input.hypertension) {
      actions.push({
        icon: "heart-pulse",
        text: "同步核对血压管理和用药情况，纳入综合慢病随访。"
      });
    }
    if (!actions.length) {
      actions.push({
        icon: "circle-check",
        text: "保持常规健康管理，按基层服务安排进行随访。"
      });
    }
    return actions.slice(0, 5);
  }

  function renderAssessment() {
    const assessment = currentAssessment;
    if (!assessment) return;

    const bandText = {
      high: "建议尽快评估",
      medium: "建议近期关注",
      low: "保持健康管理"
    }[assessment.band];
    const bandClass = assessment.band;
    const riskBand = $("#riskBand");
    riskBand.textContent = bandText;
    riskBand.className = `band-pill ${bandClass}`;
    $("#riskIndex").textContent = assessment.riskIndex;
    $("#riskPercentile").textContent = `位于样本前${Math.max(
      1,
      100 - assessment.riskIndex
    )}%`;
    $(".risk-probability small").textContent =
      "分数越高，越建议优先进行健康评估";

    const gauge = $("#riskGauge");
    const gaugeColor =
      assessment.band === "high"
        ? "var(--coral)"
        : assessment.band === "medium"
          ? "var(--amber)"
          : "var(--green)";
    gauge.style.background = `conic-gradient(${gaugeColor} 0deg, ${gaugeColor} ${
      assessment.riskIndex * 3.6
    }deg, #e6e9e4 ${assessment.riskIndex * 3.6}deg)`;

    const residentContributors = assessment.contributors.filter(
      (item) => !residentMacroVariables.has(item.variable)
    );
    const topContributors = residentContributors.slice(0, 6);
    const maxContribution = Math.max(
      ...topContributors.map((item) => Math.abs(item.contribution)),
      0.01
    );
    $("#driverList").innerHTML = topContributors
      .map((item) => {
        const width = Math.max(
          5,
          Math.round((Math.abs(item.contribution) / maxContribution) * 100)
        );
        const direction = item.contribution >= 0 ? "increase" : "protective";
        const signed = item.contribution >= 0 ? "+" : "";
        return `
          <div class="driver-row">
            <span title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</span>
            <div class="driver-bar ${direction === "protective" ? "protective" : ""}">
              <span style="--value:${width}%"></span>
            </div>
            <span class="driver-value">${signed}${item.contribution.toFixed(2)}</span>
          </div>
        `;
      })
      .join("");
    renderLocalShap({ ...assessment, contributors: residentContributors });

    $("#actionList").innerHTML = buildActions()
      .map(
        (action) => `
          <li>
            <i data-lucide="${action.icon}"></i>
            <span>${escapeHtml(action.text)}</span>
          </li>
        `
      )
      .join("");
    refreshIcons();
    renderPreviewQueue();
  }

  function renderLocalShap(assessment) {
    const items = assessment.contributors.slice(0, 7);
    const maxAbs = Math.max(...items.map((item) => Math.abs(item.contribution)), 0.01);
    const width = 420;
    const rowHeight = 30;
    const top = 34;
    const center = 210;
    const halfWidth = 158;
    const height = top + items.length * rowHeight + 12;
    const bars = items
      .map((item, index) => {
        const y = top + index * rowHeight;
        const magnitude = Math.max(3, (Math.abs(item.contribution) / maxAbs) * halfWidth);
        const positive = item.contribution >= 0;
        const x = positive ? center : center - magnitude;
        const fill = positive ? "#C75A43" : "#176B68";
        return `
          <text x="4" y="${y + 18}" font-size="11" fill="#4B5854">${escapeSvg(item.label)}</text>
          <rect x="${x}" y="${y}" width="${magnitude}" height="18" rx="2" fill="${fill}" opacity="0.88"></rect>
          <text x="${positive ? center + magnitude + 5 : center - magnitude - 5}" y="${y + 15}" text-anchor="${positive ? "start" : "end"}" font-size="10" fill="#697471">${positive ? "+" : ""}${item.contribution.toFixed(2)}</text>
        `;
      })
      .join("");
    $("#localShapChart").innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="局部SHAP贡献图">
        <line x1="${center}" y1="23" x2="${center}" y2="${height - 6}" stroke="#B9C4BE" stroke-width="1"></line>
        <text x="${center + 6}" y="17" font-size="10" fill="#697471">推高风险 →</text>
        <text x="${center - 6}" y="17" text-anchor="end" font-size="10" fill="#697471">← 降低风险</text>
        ${bars}
      </svg>
    `;
  }

  function escapeSvg(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function getResidenceGroup(row) {
    if (row.city === 1) return "城市";
    if (row.town === 1) return "城镇";
    return "农村";
  }

  function topModifiableFactor(row) {
    const factors = [
      [row.smoking, "戒烟服务"],
      [row.drinking, "饮酒评估"],
      [row.hypertension, "血压管理"],
      [row.bmi >= 24, "体重管理"],
      [row.exercise === 0, "活动指导"],
      [row.low_fruit, "蔬果摄入"]
    ];
    return factors.find(([flag]) => Boolean(flag))?.[1] || "常规随访";
  }

  function renderPreviewQueue() {
    const tbody = $("#previewQueueBody");
    if (!tbody) return;
    const top = [...DATA.cohort]
      .sort((a, b) => b.predicted_logit - a.predicted_logit)
      .slice(0, 5);
    tbody.innerHTML = top
      .map(
        (row, index) => `
          <tr>
            <td>${String(index + 1).padStart(2, "0")}</td>
            <td>${row.age}岁</td>
            <td>${escapeHtml(row.residence_group)}</td>
            <td>
              <span class="risk-cell ${row.risk_index < 50 ? "low" : row.risk_index < 80 ? "medium" : ""}">
                ${(row.predicted_logit * 100).toFixed(1)}%
              </span>
            </td>
            <td>${escapeHtml(topModifiableFactor(row))}</td>
          </tr>
        `
      )
      .join("");
  }

  function getScreeningRows() {
    const combined = [...DATA.cohort, ...communityCases];
    const filtered =
      screeningState.group === "all"
        ? combined
        : combined.filter((row) => row.residence_group === screeningState.group);
    const key =
      screeningState.strategy === "logit" ? "predicted_logit" : "predicted_xgb";
    return [...filtered].sort((a, b) => b[key] - a[key]);
  }

  function renderScreening() {
    const rows = getScreeningRows();
    const selectedN = Math.ceil(rows.length * screeningState.capacity);
    const selected = rows.slice(0, selectedN);
    const totalCases = rows.filter((row) => row.y === 1).length;
    const captured = selected.filter((row) => row.y === 1).length;
    const missed = totalCases - captured;
    const selectedDemo = selected.filter((row) => !row.custom);
    const nns = captured ? selectedDemo.length / captured : null;

    $("#selectedCount").textContent = formatNumber(selectedN);
    $("#capturedCases").textContent = formatNumber(captured);
    $("#captureRate").textContent = totalCases ? formatPercent(captured / totalCases) : "0%";
    $("#nnsValue").textContent = nns ? nns.toFixed(1) : "—";
    $("#missedCases").textContent = formatNumber(missed);
    $("#capacityOutput").textContent = `${Math.round(screeningState.capacity * 100)}%`;
    $("#communityCaseCount").textContent = `本次录入 ${communityCases.length} 人`;
    $("#clearCommunityCases").disabled = communityCases.length === 0;

    $("#screeningQueueBody").innerHTML = selected
      .slice(0, 12)
      .map(
        (row, index) => `
          <tr>
            <td>${String(index + 1).padStart(2, "0")}</td>
            <td class="object-cell">
              <span class="source-tag ${row.custom ? "is-custom" : ""}">${row.custom ? "社区录入" : "演示样本"}</span>
              ${row.custom ? `<strong>${escapeHtml(row.name)}</strong>` : ""}
            </td>
            <td>${row.age}岁</td>
            <td>${escapeHtml(row.residence_group)}</td>
            <td>
              <span class="risk-cell ${row.risk_index < 50 ? "low" : row.risk_index < 80 ? "medium" : ""}">
                ${(row.predicted_logit * 100).toFixed(1)}%
              </span>
            </td>
            <td>${escapeHtml(topModifiableFactor(row))}</td>
          </tr>
        `
      )
      .join("");

    renderFairness(selected);
    renderCommunityCaseList();
  }

  function renderCommunityCaseList() {
    const container = $("#communityCaseList");
    if (!container) return;
    if (!communityCases.length) {
      container.innerHTML =
        '<p class="community-entry-empty">尚未录入社区服务对象。点击“录入服务对象”添加。</p>';
      return;
    }
    container.innerHTML = communityCases
      .map(
        (item) => `
          <article class="community-entry-item">
            <span class="source-tag is-custom">社区录入</span>
            <strong>${escapeHtml(item.name)}</strong>
            <span>${Number(item.age) || "—"}岁 · 风险指数 ${Number(item.risk_index) || 0}/100</span>
            <button class="text-button danger-text" type="button" data-community-delete="${escapeHtml(
              item.id
            )}">
              <i data-lucide="x"></i>
              移除
            </button>
          </article>
        `
      )
      .join("");
    refreshIcons();
  }

  function renderFairness(selected) {
    const selectedSet = new Set(selected);
    const groups = ["城市", "城镇", "农村"];
    const stats = groups.map((group) => {
      const groupRows = DATA.cohort.filter((row) => row.residence_group === group);
      const groupSelected = groupRows.filter((row) => selectedSet.has(row));
      const rate = groupRows.length ? groupSelected.length / groupRows.length : 0;
      const cases = groupRows.filter((row) => row.y === 1).length;
      const captured = groupSelected.filter((row) => row.y === 1).length;
      return {
        group,
        n: groupRows.length,
        rate,
        cases,
        coverage: cases ? captured / cases : 0
      };
    });
    const maxRate = Math.max(...stats.map((item) => item.rate), 0.01);
    $("#fairnessGroups").innerHTML = stats
      .map(
        (item) => `
          <div class="fairness-row">
            <span>${item.group}</span>
            <div class="fairness-bar">
              <span style="width:${Math.max(3, (item.rate / maxRate) * 100)}%"></span>
            </div>
            <span>${formatPercent(item.rate)}</span>
          </div>
          <p class="fairness-detail">
            入选${Math.round(item.rate * item.n)}人 · 回测覆盖${formatPercent(item.coverage)}
          </p>
        `
      )
      .join("");
  }

  function renderMetrics() {
    const logistic = DATA.metricsCv.find((row) => row.model === "Logistic");
    $("#cvAuc").textContent = Number(logistic.auc).toFixed(3);
    $("#cvPrauc").textContent = Number(logistic.pr_auc).toFixed(3);
    $("#cvBrier").textContent = Number(logistic.brier).toFixed(4);
    $("#eventRate").textContent = formatPercent(Number(logistic.prevalence));
    if ($("#sampleCount")) {
      $("#sampleCount").textContent = formatNumber(DATA.model.cohortN);
    }
    if ($("#eventCount")) {
      $("#eventCount").textContent = formatNumber(DATA.model.events);
    }
  }

  function downloadText(filename, content, mime = "text/plain;charset=utf-8") {
    const blob = new Blob(["\ufeff", content], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportQueue() {
    const rows = getScreeningRows();
    const selectedN = Math.ceil(rows.length * screeningState.capacity);
    const selected = rows.slice(0, selectedN);
    const header = "序号,服务对象,来源,年龄,居住地,风险指数,主要可干预因素,回测结局\n";
    const body = selected
      .map(
        (row, index) =>
          `${index + 1},${row.custom ? row.name : "匿名对象"},${row.custom ? "社区录入" : "演示对象"},${row.age},${getResidenceGroup(row)},${row.risk_index},${topModifiableFactor(
            row
          )},${row.y ?? "无"}`
      )
      .join("\n");
    downloadText(`脱敏筛查名单_${Date.now()}.csv`, header + body);
    showToast("已导出脱敏筛查名单");
  }

  function copyAssessment() {
    if (!currentAssessment) calculateAssessment();
    const bandText = {
      high: "建议尽快评估",
      medium: "建议近期关注",
      low: "保持健康管理"
    }[currentAssessment.band];
    const top = currentAssessment.contributors
      .filter((item) => !residentMacroVariables.has(item.variable))
      .slice(0, 4)
      .map((item) => `${item.label}（${item.contribution >= 0 ? "+" : ""}${item.contribution.toFixed(2)}）`)
      .join("、");
    const text = `家庭糖尿病风险画像
所在省份：${currentAssessment.province || "未选择（按全国平均背景）"}
风险指数：${currentAssessment.riskIndex}/100
相对提示：${bandText}
主要贡献：${top}
建议：${buildActions()
      .map((item) => item.text)
      .join("；")}
说明：本结果仅用于同群体筛查排序，不等同于患病概率，不构成医学诊断，也不直接决定医保待遇资格。`;
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("评估摘要已复制"))
      .catch(() => {
        downloadText("糖尿病筛查评估摘要.txt", text);
        showToast("当前环境不支持剪贴板，已下载摘要");
      });
  }

  function syncAdlInput() {
    const checkedItems = adlItemFields.filter((input) => input.checked);
    formFields.adl.value = String(checkedItems.length);
    return checkedItems;
  }

  function updateAdlOutput() {
    const checkedItems = syncAdlInput();
    $("#adlOutput").textContent = `${checkedItems.length}项`;
  }

  function readResidentRecords() {
    try {
      const raw = window.localStorage.getItem(residentRecordStorageKey);
      const records = raw ? JSON.parse(raw) : [];
      return Array.isArray(records)
        ? records.filter((record) => record && typeof record === "object")
        : [];
    } catch {
      return [];
    }
  }

  function writeResidentRecords(records) {
    try {
      window.localStorage.setItem(
        residentRecordStorageKey,
        JSON.stringify(records.slice(0, residentRecordLimit))
      );
      return true;
    } catch {
      showToast("浏览器未允许本地保存，请检查隐私设置");
      return false;
    }
  }

  function getResidentFormState() {
    const fields = {};
    Object.entries(formFields).forEach(([key, element]) => {
      if (!element) return;
      fields[key] = element.type === "checkbox" ? element.checked : element.value;
    });
    return {
      fields,
      adlItems: adlItemFields
        .filter((input) => input.checked)
        .map((input) => input.value)
    };
  }

  function applyResidentFormState(state) {
    const fields = state?.fields || {};
    Object.entries(fields).forEach(([key, value]) => {
      const element = formFields[key];
      if (!element) return;
      if (element.type === "checkbox") {
        element.checked = Boolean(value);
      } else {
        element.value = value;
      }
    });
    const selectedAdlItems = new Set(state?.adlItems || []);
    adlItemFields.forEach((input) => {
      input.checked = selectedAdlItems.has(input.value);
    });
    updateAdlOutput();
    updateProvinceContextNote();
  }

  function getResidentBandText(band) {
    return {
      high: "建议尽快评估",
      medium: "建议近期关注",
      low: "保持健康管理"
    }[band] || "待评估";
  }

  function formatRecordDate(savedAt) {
    const date = new Date(savedAt);
    return Number.isNaN(date.getTime())
      ? String(savedAt || "")
      : date.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
  }

  function renderResidentRecords() {
    const container = $("#residentRecordList");
    if (!container) return;
    const records = readResidentRecords();
    if (!records.length) {
      container.innerHTML = `
        <div class="resident-record-empty">
          <i data-lucide="folder-heart"></i>
          <div>
            <strong>还没有保存家庭记录</strong>
            <p>完成一次风险画像后，点击“保存到我的家庭记录”即可在本机留档。</p>
          </div>
        </div>
      `;
      refreshIcons();
      return;
    }

    container.innerHTML = records
      .map((record) => {
        const adlLabels = (record.adlItems || [])
          .map((value) => adlLabelMap[value] || value)
          .join("、");
        return `
          <article class="resident-record-card">
            <div class="resident-record-main">
              <div class="resident-record-title">
                <strong>${escapeHtml(record.name || "未命名成员")}</strong>
                <span class="band-pill ${escapeHtml(record.band || "medium")}">${escapeHtml(
                  getResidentBandText(record.band)
                )}</span>
              </div>
              <p>省份 <strong>${escapeHtml(
                record.province || record.state?.fields?.province || "全国平均背景"
              )}</strong> · 风险指数 <strong>${Number(
                record.riskIndex
              ) || 0}/100</strong> · ADL需要帮助 <strong>${Number(
                record.adlCount
              ) || 0}项</strong></p>
              <small>${escapeHtml(adlLabels || "6项日常活动均可独立完成")} · ${escapeHtml(
                formatRecordDate(record.savedAt)
              )}</small>
            </div>
            <div class="resident-record-actions">
              <button class="text-button" type="button" data-record-action="load" data-record-id="${escapeHtml(
                record.id
              )}">
                <i data-lucide="folder-open"></i>
                回看
              </button>
              <button class="text-button danger-text" type="button" data-record-action="delete" data-record-id="${escapeHtml(
                record.id
              )}">
                <i data-lucide="trash-2"></i>
                删除
              </button>
            </div>
          </article>
        `;
      })
      .join("");
    refreshIcons();
  }

  function saveResidentRecord() {
    if (!currentAssessment) calculateAssessment();
    const name = formFields.profileName.value.trim() || "未命名成员";
    const checkedItems = syncAdlInput();
    const record = {
      id:
        window.crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      province: formFields.province.value || "全国平均背景",
      savedAt: new Date().toISOString(),
      riskIndex: currentAssessment.riskIndex,
      band: currentAssessment.band,
      adlCount: checkedItems.length,
      adlItems: checkedItems.map((input) => input.value),
      state: getResidentFormState()
    };
    const records = readResidentRecords().filter(
      (item) => String(item.name).trim() !== name
    );
    records.unshift(record);
    if (!writeResidentRecords(records)) return;
    renderResidentRecords();
    showToast(`已保存“${name}”的家庭健康记录`);
  }

  function loadResidentRecord(recordId) {
    const record = readResidentRecords().find((item) => item.id === recordId);
    if (!record) {
      showToast("未找到这条家庭记录");
      renderResidentRecords();
      return;
    }
    applyResidentFormState(record.state);
    calculateAssessment();
    $("#riskForm").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(`已载入“${record.name || "未命名成员"}”的记录`);
  }

  function deleteResidentRecord(recordId) {
    const records = readResidentRecords();
    const record = records.find((item) => item.id === recordId);
    if (!record) return;
    if (!window.confirm(`确定删除“${record.name || "未命名成员"}”的家庭记录吗？`)) {
      return;
    }
    writeResidentRecords(records.filter((item) => item.id !== recordId));
    renderResidentRecords();
    showToast("已删除该条家庭记录");
  }

  function clearResidentRecords() {
    if (!readResidentRecords().length) {
      showToast("当前没有可清空的家庭记录");
      return;
    }
    if (!window.confirm("确定清空当前浏览器保存的全部家庭健康记录吗？此操作不可撤销。")) {
      return;
    }
    writeResidentRecords([]);
    renderResidentRecords();
    showToast("家庭健康记录已清空");
  }

  function csvCell(value) {
    return `"${String(value ?? "").replaceAll('"', '""')}"`;
  }

  function exportResidentRecords() {
    const records = readResidentRecords();
    if (!records.length) {
      showToast("暂无可导出的家庭记录");
      return;
    }
    const sexMap = { "0": "女性", "1": "男性" };
    const residenceMap = { rural: "农村", town: "城镇", city: "城市" };
    const managementMap = {
      unknown: "未明确诊断",
      diagnosed: "已诊断未申报",
      pending: "已申报待补正",
      enrolled: "已享受待遇"
    };
    const headers = [
      "记录名称",
      "保存时间",
      "相对风险指数",
      "相对提示",
      "所在省份",
      "ADL需要帮助项数",
      "ADL具体项目",
      "年龄",
      "性别",
      "居住地",
      "管理状态",
      "BMI",
      "腰高比",
      "小腿围",
      "收缩压",
      "舒张压",
      "吸烟状态",
      "吸烟包年数",
      "饮酒状态",
      "每周酒精克数",
      "规律锻炼",
      "基线高血压",
      "水果摄入不足",
      "蔬菜摄入不足",
      "甜食频率",
      "腌制蔬菜频率"
    ];
    const rows = records.map((record) => {
      const fields = record.state?.fields || {};
      return [
        record.name,
        formatRecordDate(record.savedAt),
        record.riskIndex,
        getResidentBandText(record.band),
        record.province || fields.province || "全国平均背景",
        record.adlCount,
        (record.adlItems || []).map((value) => adlLabelMap[value] || value).join("、"),
        fields.age,
        sexMap[fields.sex] || fields.sex,
        residenceMap[fields.residence] || fields.residence,
        managementMap[fields.managementStatus] || fields.managementStatus,
        fields.bmi,
        fields.waistHeight,
        fields.calf,
        fields.systolic,
        fields.diastolic,
        fields.smoking,
        fields.packYears,
        fields.drinking,
        fields.alcoholWeek,
        fields.exercise ? "是" : "否",
        fields.hypertension ? "是" : "否",
        fields.lowFruit ? "是" : "否",
        fields.lowVegetable ? "是" : "否",
        fields.sugarFreq,
        fields.preservedVeg
      ].map(csvCell);
    });
    const csv = [headers.map(csvCell), ...rows]
      .map((row) => row.join(","))
      .join("\n");
    downloadText(
      `智能识糖_家庭健康记录_${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      "text/csv;charset=utf-8"
    );
    showToast("家庭健康记录已导出");
  }

  function loadHighRiskExample() {
    formFields.profileName.value = "高风险示例";
    formFields.province.value = "湖北省";
    formFields.age.value = 83;
    formFields.sex.value = "0";
    formFields.residence.value = "town";
    formFields.managementStatus.value = "diagnosed";
    formFields.bmi.value = 27.5;
    formFields.waistHeight.value = 0.61;
    formFields.calf.value = 30;
    formFields.education.value = 0;
    formFields.systolic.value = 162;
    formFields.diastolic.value = 78;
    formFields.selfHealth.value = "4";
    formFields.smoking.value = "former";
    formFields.packYears.value = 24;
    formFields.drinking.value = "current";
    formFields.alcoholWeek.value = 210;
    formFields.passiveSmoke.value = "2";
    formFields.sugarFreq.value = "2";
    formFields.preservedVeg.value = "1";
    formFields.exercise.checked = false;
    formFields.hypertension.checked = true;
    formFields.lowFruit.checked = true;
    formFields.lowVegetable.checked = true;
    adlItemFields.forEach((input) => {
      input.checked = input.value === "feeding";
    });
    updateAdlOutput();
    updateProvinceContextNote();
    calculateAssessment();
  }

  function readCommunityCases() {
    try {
      const raw = window.sessionStorage.getItem(COMMUNITY_CASES_STORAGE_KEY);
      const rows = raw ? JSON.parse(raw) : [];
      return Array.isArray(rows)
        ? rows.filter((row) => row?.custom && row?.source === "community")
        : [];
    } catch {
      return [];
    }
  }

  function persistCommunityCases() {
    try {
      window.sessionStorage.setItem(
        COMMUNITY_CASES_STORAGE_KEY,
        JSON.stringify(communityCases)
      );
    } catch {
      // Keep the current-page entries usable if storage is blocked.
    }
  }

  function restoreCommunityCases() {
    communityCases = readCommunityCases();
    communityCaseSeq = communityCases.reduce((max, item) => {
      const number = Number(String(item.id).match(/\d+$/)?.[0] || 0);
      return Math.max(max, number);
    }, 0);
  }

  function openCommunityCaseDialog() {
    if (activeRole !== "community") return;
    const dialog = $("#communityCaseDialog");
    const form = $("#communityCaseForm");
    if (!dialog || !form) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    refreshIcons();
  }

  function closeCommunityCaseDialog() {
    const dialog = $("#communityCaseDialog");
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function predictCommunityRisk(features) {
    const linearPredictor =
      DATA.model.intercept +
      DATA.model.coefficients.reduce((sum, feature) => {
        const raw = features[feature.variable] ?? feature.mean;
        const z = (raw - feature.mean) / (feature.sd || 1);
        return sum + feature.coefficient * z;
      }, 0);
    return 1 / (1 + Math.exp(-linearPredictor));
  }

  function handleCommunityCaseSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const province = String(data.get("province") || "");
    const provinceContext = PROVINCE_CONTEXTS[province] || NATIONAL_CONTEXT;
    const residence = String(data.get("residence") || "rural");
    const smoking = String(data.get("smoking") || "none");
    const drinking = String(data.get("drinking") || "none");
    const systolic = Number(data.get("systolic")) || 138;
    const diastolic = Number(data.get("diastolic")) || 79;
    const age = Number(data.get("age")) || 78;
    const sex = String(data.get("sex") || "女");
    const name = String(data.get("name") || "服务对象").trim();
    const features = {
      age,
      male: sex === "男" ? 1 : 0,
      city: residence === "city" ? 1 : 0,
      town: residence === "town" ? 1 : 0,
      current_smoke: smoking === "current" ? 1 : 0,
      log_pack_years: Math.log1p(Number(data.get("packYears")) || 0),
      passive_smoke_count: Number(data.get("passiveSmoke")) || 0,
      current_drink: drinking === "current" ? 1 : 0,
      log_alcohol_g_week: Math.log1p(Number(data.get("alcoholWeek")) || 0),
      exercise: Number(data.get("exercise")) || 0,
      hypertension: Number(data.get("hypertension")) || 0,
      self_health: Number(data.get("selfHealth")) || 3,
      education_years: Number(data.get("education")) || 0,
      bmi: Number(data.get("bmi")) || 22.2,
      waist_height_ratio: Number(data.get("waistHeight")) || 0.52,
      calf: Number(data.get("calf")) || 31,
      pulse_pressure: clamp(systolic - diastolic, 10, 150),
      adl_limitations: clamp(Number(data.get("adl")) || 0, 0, 6),
      low_fruit: Number(data.get("lowFruit")) || 0,
      low_vegetable: Number(data.get("lowVegetable")) || 0,
      preserved_vegetable_freq: Number(data.get("preservedVeg")) || 3,
      sugar_freq: Number(data.get("sugarFreq")) || 3,
      tea_freq: 3.87,
      pm25_2014: provinceContext.pm25_2014,
      log_income_2014: provinceContext.log_income_2014,
      log_gdp_2014: provinceContext.log_gdp_2014,
      province
    };
    const probability = predictCommunityRisk(features);
    const riskIndex = getRiskIndex(probability);
    communityCaseSeq += 1;
    communityCases.push({
      ...features,
      id: `C-${String(communityCaseSeq).padStart(3, "0")}`,
      name,
      sex,
      residence_group:
        residence === "city" ? "城市" : residence === "town" ? "城镇" : "农村",
      managementStatus: String(data.get("managementStatus") || "unknown"),
      smoking,
      drinking,
      predicted_logit: probability,
      predicted_xgb: probability,
      risk_index: riskIndex,
      risk_band: riskIndex >= 80 ? "high" : riskIndex >= 50 ? "medium" : "low",
      y: null,
      custom: true,
      source: "community"
    });
    persistCommunityCases();
    closeCommunityCaseDialog();
    form.reset();
    renderScreening();
    showToast(`已录入 ${name}，并加入社区筛查排序`);
  }

  function clearCommunityCases() {
    if (!communityCases.length) return;
    if (!window.confirm("确定清空当前标签页录入的全部社区服务对象吗？")) return;
    communityCases = [];
    communityCaseSeq = 0;
    persistCommunityCases();
    renderScreening();
    showToast("已清空社区录入对象");
  }

  function deleteCommunityCase(caseId) {
    const item = communityCases.find((entry) => entry.id === caseId);
    if (!item) return;
    communityCases = communityCases.filter((entry) => entry.id !== caseId);
    persistCommunityCases();
    renderScreening();
    showToast(`已移除 ${item.name}`);
  }

  const DOC_LABELS = {
    identity: "身份与参保凭证",
    diagnosis: "糖尿病诊断证明",
    record: "近两年病历或出院记录",
    evidence: "符合准入标准的佐证",
    institution: "拟就诊机构信息",
    contact: "联系电话"
  };

  function readImportedReviewCases() {
    try {
      const raw = window.sessionStorage.getItem(IMPORTED_REVIEW_STORAGE_KEY);
      const rows = raw ? JSON.parse(raw) : [];
      return Array.isArray(rows)
        ? rows.filter((item) => item?.id && item?.source === "imported")
        : [];
    } catch {
      return [];
    }
  }

  function persistImportedReviewCases() {
    try {
      const imported = reviewCases.filter((item) => item.source === "imported");
      window.sessionStorage.setItem(
        IMPORTED_REVIEW_STORAGE_KEY,
        JSON.stringify(imported)
      );
    } catch {
      // Demo remains usable when session storage is unavailable.
    }
  }

  function restoreImportedReviewCases() {
    const imported = readImportedReviewCases();
    if (!imported.length) return;
    reviewCases.unshift(...imported);
    const maxId = imported.reduce((max, item) => {
      const number = Number(String(item.id).match(/\d+$/)?.[0] || 0);
      return Math.max(max, number);
    }, 2606);
    reviewSeq = Math.max(reviewSeq, maxId - 2606);
  }

  function nextReviewId() {
    reviewSeq += 1;
    return `TC-${2606 + reviewSeq}`;
  }

  function deriveReviewCase(payload) {
    const docs = Object.keys(DOC_LABELS).map((key) => {
      const provided = payload.docs.includes(key);
      return [DOC_LABELS[key], provided ? "已读取" : "未提供", provided ? "ok" : "bad"];
    });
    const findDoc = (label) => docs.find((doc) => doc[0] === label);
    const issues = [];

    if (payload.flags.includes("dateConflict")) {
      const target = findDoc(DOC_LABELS.record);
      target[1] = "日期与检查报告不一致";
      target[2] = "warn";
      issues.push("门诊病历日期晚于检查报告日期", "需人工核对材料先后关系及诊断时间");
    }
    if (payload.flags.includes("textMismatch")) {
      const target = findDoc(DOC_LABELS.diagnosis);
      target[1] = "病种名称表述不一致";
      target[2] = "warn";
      issues.push("申请病种与诊断证明文字表述不一致", "需人工判断是否属于同一病种");
    }
    if (payload.flags.includes("expired")) {
      issues.push("原预约时间已过期", "建议重新预约并发送到场材料提醒");
    }

    const missing = docs.filter((doc) => doc[2] === "bad");
    if (missing.length) {
      issues.unshift(`缺少材料：${missing.map((doc) => doc[0]).join("、")}`);
    }

    let status = "材料齐全";
    let statusLevel = "green";
    if (payload.flags.includes("dateConflict")) {
      status = "信息冲突";
      statusLevel = "amber";
    } else if (payload.flags.includes("textMismatch")) {
      status = "需人工核验";
      statusLevel = "amber";
    } else if (payload.flags.includes("expired")) {
      status = "预约过期";
      statusLevel = "amber";
    } else if (missing.length) {
      status = "待补正";
      statusLevel = "red";
    }

    return {
      id: payload.id,
      name: payload.name,
      age: payload.age,
      sex: payload.sex,
      disease: "糖尿病",
      status,
      statusLevel,
      priority: clamp(70 + missing.length * 8 + (status === "待补正" ? 10 : 0), 60, 99),
      deadline: payload.deadline,
      submitted: payload.submitted,
      institution: payload.institution,
      appointment: payload.appointment,
      docs,
      issues: issues.length ? issues : ["未发现材料完整性或字段关系异常。"],
      notes:
        payload.notes ||
        "本条为界面导入的演示案例，系统仅提示材料可能不完整，不判断医学诊断是否成立。",
      source: "imported"
    };
  }

  function openCaseImport() {
    if (activeRole !== "insurance") return;
    const dialog = $("#caseImportDialog");
    const form = $("#caseImportForm");
    if (!dialog || !form) return;
    $("#importCaseId").value = `TC-${2606 + reviewSeq + 1}`;
    if (!form.elements.submitted.value) form.elements.submitted.value = todayISO();
    if (!form.elements.deadline.value) {
      const future = new Date();
      future.setDate(future.getDate() + 14);
      form.elements.deadline.value = toISODate(future);
    }
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    refreshIcons();
  }

  function closeCaseImport() {
    const dialog = $("#caseImportDialog");
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function handleCaseSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      id: nextReviewId(),
      name: String(data.get("name") || "匿名").trim(),
      age: Number(data.get("age")) || 0,
      sex: String(data.get("sex") || "女"),
      submitted: String(data.get("submitted") || todayISO()),
      deadline: String(data.get("deadline") || todayISO()),
      appointment: String(data.get("appointment") || "未安排"),
      institution: String(data.get("institution") || "未填写"),
      docs: data.getAll("doc"),
      flags: data.getAll("flag"),
      notes: String(data.get("notes") || "").trim()
    };
    const caseItem = deriveReviewCase(payload);
    reviewCases.unshift(caseItem);
    activeCaseId = caseItem.id;
    persistImportedReviewCases();
    renderReviewList();
    renderCaseDetail(caseItem);
    closeCaseImport();
    form.reset();
    $("#importCaseId").value = `TC-${2606 + reviewSeq + 1}`;
    showToast(`已导入 ${caseItem.id}，预审结论：${caseItem.status}`);
  }

  function renderReviewList() {
    $("#caseQueueCount").textContent = reviewCases.length;
    $("#caseList").innerHTML = reviewCases
      .map(
        (item) => `
          <button class="case-item ${item.id === activeCaseId ? "is-active" : ""}" type="button" data-case-id="${item.id}">
            <div class="case-item-top">
              <strong>${escapeHtml(item.id)} · ${escapeHtml(item.name)}</strong>
              <span class="status-pill ${escapeHtml(item.statusLevel)}">${escapeHtml(item.status)}</span>
            </div>
            <p>${Number(item.age) || "—"}岁 · ${escapeHtml(item.sex)} · ${escapeHtml(item.disease)} · 截止 ${escapeHtml(item.deadline)}${item.source === "imported" ? " · 导入" : ""}</p>
          </button>
        `
      )
      .join("");
  }

  function renderCaseDetail(caseItem) {
    if (!caseItem) {
      $("#caseDetail").innerHTML = `
        <div class="empty-detail">
          <i data-lucide="file-search"></i>
          <p>选择一个案例查看辅助预审结果</p>
        </div>
      `;
      refreshIcons();
      return;
    }

    const okCount = caseItem.docs.filter(([, , status]) => status === "ok").length;
    $("#caseDetail").innerHTML = `
      <div class="case-detail-head">
        <div>
          <span class="kicker">案例 ${escapeHtml(caseItem.id)}${caseItem.source === "imported" ? " · 本次导入" : ""}</span>
          <h3>${escapeHtml(caseItem.name)} · 糖尿病待遇认定</h3>
          <p>${Number(caseItem.age) || "—"}岁 · ${escapeHtml(caseItem.sex)} · ${escapeHtml(caseItem.institution)}</p>
        </div>
        <span class="status-pill ${escapeHtml(caseItem.statusLevel)}">${escapeHtml(caseItem.status)}</span>
      </div>

      <div class="case-summary-grid">
        <div class="summary-cell"><span>提交日期</span><strong>${escapeHtml(caseItem.submitted)}</strong></div>
        <div class="summary-cell"><span>截止日期</span><strong>${escapeHtml(caseItem.deadline)}</strong></div>
        <div class="summary-cell"><span>预约信息</span><strong>${escapeHtml(caseItem.appointment)}</strong></div>
        <div class="summary-cell"><span>材料检查</span><strong>${okCount}/${caseItem.docs.length}项</strong></div>
      </div>

      <div class="checklist">
        ${caseItem.docs
          .map(([label, note, status]) => {
            const icon = status === "ok" ? "check" : status === "warn" ? "minus" : "x";
            const statusText = status === "ok" ? "已通过" : status === "warn" ? "需核对" : "需补正";
            return `
              <div class="check-row">
                <span class="check-icon ${status}">
                  <i data-lucide="${icon}"></i>
                </span>
                <span>
                  <strong>${escapeHtml(label)}</strong>
                  <small>${escapeHtml(note)}</small>
                </span>
                <span class="check-status">${statusText}</span>
              </div>
            `;
          })
          .join("")}
      </div>

      <div class="detail-columns">
        <div class="detail-block">
          <h4>系统预审提示</h4>
          <ul>
            ${
              caseItem.issues.length
                ? caseItem.issues.map((issue) => `<li>${escapeHtml(issue)}</li>`).join("")
                : "<li>未发现材料完整性或字段关系异常。</li>"
            }
          </ul>
        </div>
        <div class="detail-block">
          <h4>人工核验说明</h4>
          <ul>
            <li>${escapeHtml(caseItem.notes)}</li>
            <li>系统不作出医学诊断或法定资格决定。</li>
            <li>处理过程应记录经办人、规则版本和时间。</li>
          </ul>
        </div>
      </div>

      <div class="detail-actions">
        <button class="primary-button" type="button" data-case-action="reviewed">
          <i data-lucide="badge-check"></i>
          标记人工核验完成
        </button>
        <button class="secondary-button" type="button" data-case-action="correction">
          <i data-lucide="list-checks"></i>
          生成补正清单
        </button>
        <button class="secondary-button" type="button" data-case-action="reminder">
          <i data-lucide="bell-ring"></i>
          生成提醒文本
        </button>
      </div>
    `;
    refreshIcons();
  }

  function handleCaseAction(action) {
    const caseItem = reviewCases.find((item) => item.id === activeCaseId);
    if (!caseItem) return;
    if (action === "reviewed") {
      caseItem.status = "已人工核验";
      caseItem.statusLevel = "green";
      if (caseItem.source === "imported") persistImportedReviewCases();
      renderReviewList();
      renderCaseDetail(caseItem);
      showToast("已记录人工核验状态，不改变医保资格决定");
      return;
    }
    if (action === "correction") {
      const content = `糖尿病门诊慢特病材料补正清单
案例：${caseItem.id}
病种：糖尿病
截止日期：${caseItem.deadline}

需核对或补正事项：
${caseItem.issues.length ? caseItem.issues.map((item, index) => `${index + 1}. ${item}`).join("\n") : "材料清单未发现明显缺项，请继续人工核验。"}

提示：本清单由辅助预审生成，最终以医保经办人员审核为准。`;
      downloadText(`${caseItem.id}_补正清单.txt`, content);
      showToast("已生成补正清单");
      return;
    }
    if (action === "reminder") {
      const content = `${caseItem.name}家属您好：您的糖尿病门诊慢特病材料正在办理中，当前状态为“${caseItem.status}”。请在${caseItem.deadline}前核对以下事项：${caseItem.issues.join("；") || "保持电话畅通，等待经办通知"}。如有行动不便或材料获取困难，请联系参保所属区医保经办服务大厅。`;
      navigator.clipboard
        .writeText(content)
        .then(() => showToast("提醒文本已复制"))
        .catch(() => {
          downloadText(`${caseItem.id}_提醒文本.txt`, content);
          showToast("已下载提醒文本");
        });
    }
  }

  function readPolicyContent() {
    try {
      const raw = window.localStorage.getItem(POLICY_CONTENT_STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      policyExtraSources = Array.isArray(data.sources) ? data.sources : [];
      policyNotices = Array.isArray(data.notices) ? data.notices : [];
    } catch {
      policyExtraSources = [];
      policyNotices = [];
    }
  }

  function persistPolicyContent() {
    try {
      window.localStorage.setItem(
        POLICY_CONTENT_STORAGE_KEY,
        JSON.stringify({
          sources: policyExtraSources,
          notices: policyNotices
        })
      );
    } catch {
      // Policy updates remain available for the current page even if storage is blocked.
    }
  }

  function renderPolicy() {
    const policy = DATA.policy;
    $("#diseaseCode").textContent = policy.disease_code;
    $("#accessCriteria").innerHTML = policy.access_criteria.alternative_evidence
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
    $("#processSteps").innerHTML = policy.process_steps
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");

    const merged = new Map();
    policy.sources.forEach((source) => merged.set(source.id, source));
    policyExtraSources.forEach((source) => {
      merged.set(source.id, { ...(merged.get(source.id) || {}), ...source });
    });

    $("#sourceList").innerHTML = [...merged.values()]
      .map((source) => {
        const meta = [
          source.issuer,
          source.document_number,
          source.date && source.date !== "unknown"
            ? source.date
            : source.accessed || "日期未标注"
        ]
          .filter(Boolean)
          .join(" · ");
        return `
          <a class="source-item" href="${escapeHtml(source.url || "#")}" target="_blank" rel="noreferrer">
            <span>
              <strong>${escapeHtml(source.title)}${source.isNew ? '<em class="new-flag">同步更新</em>' : ""}</strong>
              <span class="source-meta">${escapeHtml(meta)}</span>
            </span>
            <i data-lucide="external-link"></i>
          </a>
        `;
      })
      .join("");

    renderNotices();
    refreshIcons();
  }

  function renderNotices() {
    const container = $("#policyNotices");
    if (!container) return;
    const count = $("#noticeCount");
    if (count) count.textContent = String(policyNotices.length);
    if (!policyNotices.length) {
      container.innerHTML = '<p class="sync-empty">暂无已确认并并入的更新条目。</p>';
      return;
    }
    container.innerHTML = policyNotices
      .map(
        (item) => `
          <article class="notice-item">
            <div class="notice-head">
              <span class="notice-type">政策动态</span>
              <span class="notice-date">${escapeHtml(item.date || "")}</span>
            </div>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.summary || "")}</p>
            <div class="notice-meta">
              <span>${escapeHtml(item.issuer || "")}</span>
              ${item.documentNumber ? `<span>${escapeHtml(item.documentNumber)}</span>` : ""}
              ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">原文链接</a>` : ""}
            </div>
          </article>
        `
      )
      .join("");
  }

  function syncStatusText(state) {
    return {
      idle: "未检查",
      checking: "检查中",
      ok: "已同步",
      offline: "离线快照",
      error: "检查失败"
    }[state.status] || "未知";
  }

  function renderPolicyDate(state) {
    const element = $("#policyDate");
    if (!element) return;
    element.textContent = `政策核验日 ${state?.feedUpdatedAt || todayISO()}`;
  }

  function renderSyncPanel(state) {
    if (!state) return;
    renderPolicyDate(state);
    const badge = $("#syncBadge");
    if (badge) {
      badge.textContent = syncStatusText(state);
      badge.className = `sync-badge is-${state.status}`;
    }
    $("#syncLastCheck").textContent = state.lastCheck ? formatDateTime(state.lastCheck) : "—";
    $("#syncItemCount").textContent = String(state.items.length);
    $("#syncPendingCount").textContent = String(state.pending.length);
    $("#syncSource").textContent =
      state.source === "remote" ? "订阅源" : state.source === "snapshot" ? "内置快照" : "—";
    const auto = $("#syncAuto");
    if (auto) auto.checked = state.auto;

    const list = $("#syncDiffList");
    if (!list) return;
    if (!state.pending.length) {
      list.innerHTML = `<p class="sync-empty">${
        state.status === "checking" ? "正在检查政策订阅源…" : "政策源无新增或变更条目。"
      }</p>`;
      return;
    }
    list.innerHTML = state.pending
      .map(
        (item) => `
          <div class="sync-item">
            <span class="sync-change ${item.change === "added" ? "is-added" : "is-changed"}">
              ${item.change === "added" ? "新增" : "变更"}
            </span>
            <div class="sync-item-main">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(
                [item.issuer, item.documentNumber, item.date].filter(Boolean).join(" · ")
              )}</span>
            </div>
            ${
              item.url
                ? `<a class="sync-link" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">原文</a>`
                : ""
            }
          </div>
        `
      )
      .join("");
  }

  function applyPolicyUpdates() {
    const plugin = window.PolicySync;
    if (!plugin) {
      showToast("政策同步插件未加载");
      return;
    }
    const state = plugin.getState();
    if (!state.pending.length) {
      showToast("没有待确认的政策更新");
      return;
    }
    let sourceCount = 0;
    let noticeCount = 0;
    state.pending.forEach((item) => {
      if (item.type === "notice") {
        const existing = policyNotices.findIndex((entry) => entry.id === item.id);
        if (existing >= 0) policyNotices.splice(existing, 1, item);
        else policyNotices.unshift(item);
        noticeCount += 1;
      } else {
        const source = {
          id: item.id,
          title: item.title,
          issuer: item.issuer,
          document_number: item.documentNumber,
          date: item.date,
          url: item.url,
          summary: item.summary,
          isNew: true
        };
        const existing = policyExtraSources.findIndex((entry) => entry.id === item.id);
        if (existing >= 0) policyExtraSources.splice(existing, 1, source);
        else policyExtraSources.push(source);
        sourceCount += 1;
      }
    });
    plugin.applyAll();
    persistPolicyContent();
    renderPolicy();
    renderSyncPanel(plugin.getState());
    showToast(`已人工并入 ${sourceCount} 条政策文件、${noticeCount} 条政策动态`);
  }

  function initPolicySync() {
    const plugin = window.PolicySync;
    if (!plugin) {
      renderPolicyDate(null);
      const badge = $("#syncBadge");
      if (badge) {
        badge.textContent = "插件未加载";
        badge.className = "sync-badge is-error";
      }
      return;
    }
    plugin.on(renderSyncPanel);
    renderPolicyDate(plugin.getState());
    renderSyncPanel(plugin.getState());
    const urlInput = $("#syncFeedUrl");
    if (urlInput) urlInput.value = plugin.getState().feedUrl;
    plugin.check();
  }

  function handleNavigation(event) {
    const roleOption = event.target.closest(".role-option[data-role]");
    if (roleOption) {
      enterRole(roleOption.dataset.role, roleOption, event);
      return;
    }
    if (event.target.closest("#switchRole")) {
      showRoleGate();
      return;
    }
    const navButton = event.target.closest("[data-view]");
    if (navButton) {
      setView(navButton.dataset.view);
      return;
    }
    if (event.target.closest("[data-go-policy]")) {
      setView("policy");
      return;
    }
    if (event.target.closest("[data-go-screening]")) {
      setView("screening");
    }
  }

  function handleGlobalClick(event) {
    const communityDelete = event.target.closest("[data-community-delete]");
    if (communityDelete) {
      deleteCommunityCase(communityDelete.dataset.communityDelete);
      return;
    }
    const recordAction = event.target.closest("[data-record-action]");
    if (recordAction) {
      if (recordAction.dataset.recordAction === "load") {
        loadResidentRecord(recordAction.dataset.recordId);
      } else if (recordAction.dataset.recordAction === "delete") {
        deleteResidentRecord(recordAction.dataset.recordId);
      }
      return;
    }
    const caseButton = event.target.closest("[data-case-id]");
    if (caseButton) {
      activeCaseId = caseButton.dataset.caseId;
      renderReviewList();
      renderCaseDetail(reviewCases.find((item) => item.id === activeCaseId));
      return;
    }
    const caseAction = event.target.closest("[data-case-action]");
    if (caseAction) {
      handleCaseAction(caseAction.dataset.caseAction);
    }
  }

  function bindButtonRipple() {
    document.addEventListener("pointerdown", (event) => {
      const button = event.target.closest("button");
      if (
        !button ||
        button.disabled ||
        button.classList.contains("role-option") ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "button-click-ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      button.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 560);
    });
  }

  function bindEvents() {
    document.addEventListener("click", handleNavigation);
    document.addEventListener("click", handleGlobalClick);
    bindButtonRipple();

    $("#riskForm").addEventListener("submit", (event) => {
      event.preventDefault();
      calculateAssessment();
      showToast("风险画像已更新");
    });

    $("#riskForm").addEventListener("input", () => {
      updateAdlOutput();
      updateProvinceContextNote();
      window.clearTimeout(window.__riskTimer);
      window.__riskTimer = window.setTimeout(calculateAssessment, 180);
    });
    $("#riskForm").addEventListener("change", () => {
      updateAdlOutput();
      updateProvinceContextNote();
      calculateAssessment();
    });

    $("#resetRiskForm").addEventListener("click", () => {
      $("#riskForm").reset();
      updateAdlOutput();
      updateProvinceContextNote();
      calculateAssessment();
      showToast("已恢复默认信息");
    });
    $("#loadHighRiskExample").addEventListener("click", loadHighRiskExample);
    $("#copyAssessment").addEventListener("click", copyAssessment);
    $("#saveResidentRecord").addEventListener("click", saveResidentRecord);
    $("#exportResidentRecords").addEventListener("click", exportResidentRecords);
    $("#clearResidentRecords").addEventListener("click", clearResidentRecords);
    $("#exportQueue").addEventListener("click", exportQueue);

    $("#capacitySlider").addEventListener("input", (event) => {
      screeningState.capacity = Number(event.target.value) / 100;
      renderScreening();
    });
    $("#groupFilter").addEventListener("change", (event) => {
      screeningState.group = event.target.value;
      renderScreening();
    });
    $("#strategySelect").addEventListener("change", (event) => {
      screeningState.strategy = event.target.value;
      renderScreening();
    });

    $("#openCaseImport").addEventListener("click", openCaseImport);
    $("#closeCaseImport").addEventListener("click", closeCaseImport);
    $("#cancelCaseImport").addEventListener("click", closeCaseImport);
    $("#caseImportForm").addEventListener("submit", handleCaseSubmit);

    $("#openCommunityCaseDialog").addEventListener("click", openCommunityCaseDialog);
    $("#closeCommunityCaseDialog").addEventListener("click", closeCommunityCaseDialog);
    $("#cancelCommunityCaseDialog").addEventListener("click", closeCommunityCaseDialog);
    $("#communityCaseForm").addEventListener("submit", handleCommunityCaseSubmit);
    $("#clearCommunityCases").addEventListener("click", clearCommunityCases);

    $("#syncNow")?.addEventListener("click", async () => {
      await window.PolicySync?.check();
      showToast("政策检查完成");
    });
    $("#syncApply")?.addEventListener("click", applyPolicyUpdates);
    $("#syncAuto")?.addEventListener("change", (event) => {
      if (!window.PolicySync) return;
      if (event.target.checked) {
        window.PolicySync.startAuto(30);
        showToast("已开启每 30 分钟自动检查");
      } else {
        window.PolicySync.stopAuto();
        showToast("已关闭自动检查");
      }
    });
    $("#syncFeedUrl")?.addEventListener("change", (event) => {
      window.PolicySync?.setFeedUrl(event.target.value.trim());
      showToast("订阅源地址已更新");
    });
  }

  function init() {
    bindEvents();
    renderMetrics();
    renderPreviewQueue();
    restoreCommunityCases();
    renderScreening();
    restoreImportedReviewCases();
    readPolicyContent();
    renderReviewList();
    renderCaseDetail(null);
    renderPolicy();
    initPolicySync();
    renderResidentRecords();
    calculateAssessment();
    updateAdlOutput();
    updateProvinceContextNote();
    refreshIcons();
    showRoleGate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
