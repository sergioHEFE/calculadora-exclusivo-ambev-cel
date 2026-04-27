const catalog = {
  300: {
    label: "300 mL",
    unitsPerBox: 23,
    defaultCurrentSalePrice: 5,
    groups: [
      {
        id: "main",
        name: "Skol, Brahma e Antarctica",
        buyNotAdhered: 2.57,
        buyAdhered: 2.37,
        saleAdhered: 3.5,
      },
      {
        id: "premium",
        name: "Budweiser e Brahma Duplo Malte",
        buyNotAdhered: 3.02,
        buyAdhered: 2.66,
        saleAdhered: 4,
      },
      {
        id: "original",
        name: "Original",
        buyNotAdhered: 3.3,
        buyAdhered: 2.94,
        saleAdhered: 4.5,
      },
    ],
  },
  1000: {
    label: "1 L",
    unitsPerBox: 12,
    defaultCurrentSalePrice: 12,
    groups: [
      {
        id: "main",
        name: "Skol, Brahma e Antarctica",
        buyNotAdhered: 7.03,
        buyAdhered: 6.65,
        saleAdhered: 9.5,
      },
      {
        id: "premium",
        name: "Budweiser e Brahma Duplo Malte",
        buyNotAdhered: 7.7,
        buyAdhered: 7.32,
        saleAdhered: 10.5,
      },
      {
        id: "original",
        name: "Original",
        buyNotAdhered: 8.48,
        buyAdhered: 8.1,
        saleAdhered: 12,
      },
    ],
  },
  600: {
    label: "600 mL",
    unitsPerBox: 24,
    defaultCurrentSalePrice: 10,
    groups: [
      {
        id: "main",
        name: "Skol, Brahma e Antarctica",
        buyNotAdhered: 6.38,
        buyAdhered: 6,
        saleAdhered: 8.5,
      },
      {
        id: "premium",
        name: "Budweiser e Brahma Duplo Malte",
        buyNotAdhered: 6.84,
        buyAdhered: 6.46,
        saleAdhered: 9.5,
      },
      {
        id: "original",
        name: "Original",
        buyNotAdhered: 7.34,
        buyAdhered: 7.21,
        saleAdhered: 11,
      },
    ],
  },
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const decimal = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const packageSize = document.querySelector("#packageSize");
const productGroup = document.querySelector("#productGroup");
const weeklyBoxes = document.querySelector("#weeklyBoxes");
const currentSalePrice = document.querySelector("#currentSalePrice");
const breakdownRows = document.querySelector("#breakdownRows");

const bindText = (id, value) => {
  document.querySelector(`#${id}`).textContent = value;
};

const getSelectedPackage = () => catalog[packageSize.value];

const getSelectedGroup = () => {
  const selectedPackage = getSelectedPackage();
  return selectedPackage.groups.find((group) => group.id === productGroup.value);
};

const money = (value) => currency.format(Number.isFinite(value) ? value : 0);
const number = (value) => decimal.format(Number.isFinite(value) ? value : 0);
const percentage = (value) => `${percent.format(Number.isFinite(value) ? value : 0)}%`;

const renderProductOptions = () => {
  const selectedPackage = getSelectedPackage();
  productGroup.innerHTML = selectedPackage.groups
    .map((group) => `<option value="${group.id}">${group.name}</option>`)
    .join("");
};

const updateCurrentSaleDefault = () => {
  currentSalePrice.value = getSelectedPackage().defaultCurrentSalePrice.toFixed(2);
};

const render = () => {
  const selectedPackage = getSelectedPackage();
  const group = getSelectedGroup();
  const boxes = Math.max(Number(weeklyBoxes.value) || 0, 0);
  const currentSale = Math.max(Number(currentSalePrice.value) || 0, 0);
  const units = selectedPackage.unitsPerBox;

  const weeklyUnits = boxes * units;
  const weeklyNotAdhered = weeklyUnits * currentSale;
  const weeklyAdhered = weeklyUnits * group.saleAdhered;
  const difference = Math.max(weeklyNotAdhered - weeklyAdhered, 0);
  const adheredRevenuePerBox = units * group.saleAdhered;
  const extraBoxes = adheredRevenuePerBox > 0 ? difference / adheredRevenuePerBox : 0;
  const totalBoxesToMatch = boxes + extraBoxes;

  const profitPerUnitAdhered = group.saleAdhered - group.buyAdhered;
  const weeklyGrossProfitAdhered = weeklyUnits * profitPerUnitAdhered;
  const netMarginAdhered = group.saleAdhered > 0 ? (profitPerUnitAdhered / group.saleAdhered) * 100 : 0;
  const markupAdhered = group.buyAdhered > 0 ? ((group.saleAdhered / group.buyAdhered) - 1) * 100 : 0;

  bindText("extraBoxes", `${number(extraBoxes)} caixas`);
  bindText("unitsPerBox", units);
  bindText("buyNotAdhered", money(group.buyNotAdhered));
  bindText("buyAdhered", money(group.buyAdhered));
  bindText("saleAdhered", money(group.saleAdhered));
  bindText("weeklyNotAdhered", money(weeklyNotAdhered));
  bindText("weeklyAdhered", money(weeklyAdhered));
  bindText("selectedProduct", `${selectedPackage.label} - ${group.name}`);

  const meterWidth = totalBoxesToMatch > 0 ? Math.min((extraBoxes / totalBoxesToMatch) * 100, 100) : 0;
  document.querySelector("#meterFill").style.width = `${meterWidth}%`;

  const rows = [
    {
      label: "Faturamento Bruto semanal não aderido",
      value: money(weeklyNotAdhered),
      formula: `${number(boxes)} caixas x ${units} unidades x ${money(currentSale)} venda atual`,
    },
    {
      label: "Faturamento Bruto semanal aderido",
      value: money(weeklyAdhered),
      formula: `${number(boxes)} caixas x ${units} unidades x ${money(group.saleAdhered)} venda aderido`,
    },
    {
      label: "Diferenca a recuperar",
      value: money(difference),
      formula: `${money(weeklyNotAdhered)} - ${money(weeklyAdhered)}`,
    },
    {
      label: "Faturamento Bruto por caixa no aderido",
      value: money(adheredRevenuePerBox),
      formula: `${money(group.saleAdhered)} x ${units} unidades`,
    },
    {
      label: "Caixas adicionais necessarias",
      value: `${number(extraBoxes)} caixas`,
      formula: `${money(difference)} / ${money(adheredRevenuePerBox)}`,
    },
    {
      label: "Total de caixas para igualar",
      value: `${number(totalBoxesToMatch)} caixas`,
      formula: `${number(boxes)} caixas atuais + ${number(extraBoxes)} caixas adicionais`,
    },
    {
      label: "Lucro bruto semanal no aderido",
      value: money(weeklyGrossProfitAdhered),
      formula: `${number(weeklyUnits)} unidades x (${money(group.saleAdhered)} - ${money(group.buyAdhered)})`,
    },
    {
      label: "Margem no aderido",
      value: percentage(netMarginAdhered),
      formula: `(${money(group.saleAdhered)} - ${money(group.buyAdhered)}) / ${money(group.saleAdhered)}`,
    },
    {
      label: "Markup no aderido",
      value: percentage(markupAdhered),
      formula: `(${money(group.saleAdhered)} / ${money(group.buyAdhered)} - 1)`,
    },
  ];

  breakdownRows.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.label}</td>
          <td>${row.value}</td>
          <td>${row.formula}</td>
        </tr>
      `,
    )
    .join("");
};

packageSize.addEventListener("change", () => {
  renderProductOptions();
  updateCurrentSaleDefault();
  render();
});

productGroup.addEventListener("change", render);
weeklyBoxes.addEventListener("input", render);
currentSalePrice.addEventListener("input", render);

renderProductOptions();
render();
