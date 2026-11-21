import type { IntentNodeTree } from "../../../services/intentTreeService";

export function collectDescendantIntentCodes(node: IntentNodeTree): Set<string> {
  const codes = new Set<string>();
  const visit = (current: IntentNodeTree) => {
    if (codes.has(current.intentCode)) return;
    codes.add(current.intentCode);
    current.children?.forEach(visit);
  };
  visit(node);
  return codes;
}
