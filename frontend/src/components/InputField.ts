interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  step?: string;
  min?: string;
  value?: string;
}

export const InputField = ({
  id,
  name,
  label,
  placeholder,
  step = "0.01",
  min = "0",
  value = "",
}: InputFieldProps): string => {
  return `
    <div class="input-field">
      <label for="${id}">${label}</label>
      <input
        id="${id}"
        name="${name}"
        type="number"
        min="${min}"
        step="${step}"
        placeholder="${placeholder}"
        value="${value}"
        required
      />
    </div>
  `;
};

interface SelectFieldProps {
  id: string;
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
}

export const SelectField = ({
  id,
  name,
  label,
  options,
  defaultValue = "",
}: SelectFieldProps): string => {
  const optionHtml = options
    .map(
      (opt) =>
        `<option value="${opt.value}"${opt.value === defaultValue ? " selected" : ""}>${opt.label}</option>`
    )
    .join("");

  return `
    <div class="input-field">
      <label for="${id}">${label}</label>
      <select id="${id}" name="${name}" required>
        ${optionHtml}
      </select>
    </div>
  `;
};
