export const warnIfMissing = (obj, fields, warnings, label) => {
  fields.forEach((field) => {
    if (obj[field] === null || obj[field] === undefined) {
      warnings.push(`${label}: Missing ${field}`);
    }
  });
};

export const warnIfDerived = (derived, warnings, note) => {
  if (derived) {
    warnings.push(note);
  }
};
