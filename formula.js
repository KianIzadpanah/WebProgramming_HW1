class FormulaEvaluator {
  constructor() {
    this.formulas = document.querySelectorAll("formula");
    this.attachEvents();
    this.updateAll();
  }

  attachEvents() {
    document.addEventListener("input", () => this.updateAll());

    const gpaContainer = document.getElementById("gpa-container");

    if (gpaContainer) {
      gpaContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-course")) {
          this.addGpaRow();
        }

        if (e.target.classList.contains("remove-course")) {
          this.removeGpaRow(e.target);
        }
      });
    }
  }

  updateAll() {
    this.formulas.forEach((formulaEl) => {
      this.evaluateFormula(formulaEl);
    });
  }

  evaluateFormula(formulaEl) {
    const evaluator = formulaEl.getAttribute("evaluator");

    if (evaluator === "calculateGPA") {
      const container = formulaEl.parentElement;
      const rows = container.querySelectorAll(".gpa-row");
      let totalWeightedGrade = 0;
      let totalCredits = 0;

      for (const row of rows) {
        const gradeInput = row.querySelector(".grade");
        const creditInput = row.querySelector(".credit");

        const gradeValue = gradeInput?.value.trim();
        const creditValue = creditInput?.value.trim();

        const grade = gradeValue === "" ? 0 : parseFloat(gradeValue);
        const credit = creditValue === "" ? 0 : parseFloat(creditValue);

        if (isNaN(grade) || isNaN(credit)) {
          formulaEl.textContent = "Invalid Formula";
          formulaEl.classList.add("invalid");
          return;
        }

        if (grade < 0 || credit < 0) {
          formulaEl.textContent =
            "Invalid Formula (Grade and Credit must be positive numbers)";
          formulaEl.classList.add("invalid");
          return;
        }

        totalWeightedGrade += grade * credit;
        totalCredits += credit;
      }

      const result = totalCredits ? totalWeightedGrade / totalCredits : 0;
      formulaEl.textContent = result;
      formulaEl.classList.remove("invalid");
    } else {
      const expr = evaluator;

      try {
        const tokens = expr.match(/\b[a-zA-Z_]\w*\b/g);
        const context = {};

        if (tokens) {
          for (const token of tokens) {
            const element = document.getElementById(token);
            const value = element?.value;

            if (value === "") {
              context[token] = 0;
              continue;
            }

            if (!/^-?\d*\.?\d+$/.test(value)) {
              formulaEl.textContent = "Invalid Formula";
              formulaEl.classList.add("invalid");
              return;
            }

            const numberValue = parseFloat(value);
            if (isNaN(numberValue)) {
              formulaEl.textContent = "Invalid Formula";
              formulaEl.classList.add("invalid");
              return;
            }

            if (expr === "weight / (height * height)" && numberValue < 0) {
              formulaEl.textContent =
                "Invalid Formula (Weight and Height must be positive numbers)";
              formulaEl.classList.add("invalid");
              return;
            }

            context[token] = numberValue;
          }
        }

        const argNames = Object.keys(context);
        const argValues = Object.values(context);
        const func = new Function(...argNames, `return ${expr};`);
        const result = func(...argValues);

        formulaEl.textContent = result;
        formulaEl.classList.remove("invalid");
      } catch (error) {
        formulaEl.textContent = "Invalid Formula";
        formulaEl.classList.add("invalid");
      }
    }
  }

  addGpaRow() {
    const gpaContainer = document.getElementById("gpa-container");
    const formulaEl = gpaContainer.querySelector("formula");

    const newRow = document.createElement("div");
    newRow.classList.add("gpa-row");

    const gradeInput = document.createElement("input");
    gradeInput.type = "text";
    gradeInput.classList.add("grade");
    gradeInput.placeholder = "Grade (/20)";

    const creditInput = document.createElement("input");
    creditInput.type = "text";
    creditInput.classList.add("credit");
    creditInput.placeholder = "Credit";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.classList.add("remove-course");
    removeBtn.textContent = "-";

    newRow.appendChild(gradeInput);
    newRow.appendChild(creditInput);
    newRow.appendChild(removeBtn);

    gpaContainer.insertBefore(newRow, formulaEl);

    this.updateAll();
  }

  removeGpaRow(clickedButton) {
    const row = clickedButton.closest(".gpa-row");
    if (row) {
      row.remove();
      this.updateAll();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FormulaEvaluator();
});
