import { Data } from "./deps.ts";
import { Domode, Hodor } from "./types.ts";

function setVal(element: any, key: string, value: any) {
  if (typeof element[key] === "object") {
    Object.assign(element[key], value);
  } else {
    element[key] = value;
  }
}

export default (
  data: Data,
  element: Domode | HTMLInputElement,
  props: (any | Hodor)[],
) => {
  const hodors: Hodor[] = [];
  let _value: any;
  const inputElement = element as HTMLInputElement;
  const domOde = element as Domode;

  function onChange(cb: Function) {
    element.addEventListener("keyup", () => cb(inputElement.value));
    element.addEventListener("input", () => {
      const value = inputElement.type === "checkbox"
        ? inputElement.checked
        : inputElement.value;
      cb(value);
    });
    element.addEventListener("value", () => cb(inputElement.value));
    element.addEventListener("checked", () => cb(inputElement.value));
  }

  function setValue(value: any) {
    _value = value;
    if (inputElement.type === "checkbox") {
      inputElement.checked = value;
    } else {
      inputElement.value = value || "";
    }
  }

  if (props) {
    const propsAsAny = props as any;
    const model = propsAsAny["dd-model"];
    if (model) {
      onChange((value: any) => data.set(model, value));
      domOde.on(`!+* ${model}`, setValue);
      // Special handling for select elements
      new MutationObserver(() => {
        if (typeof _value !== "undefined") {
          setValue(_value);
        }
      }).observe(element, { childList: true });
    }

    for (let [key, value] of Object.entries(props)) {
      if (value && value["isHodor"]) {
        let _or: any;
        value["stower"](0, {
          add: (s: any) => setVal(element, key, s),
          remove: () => {
            if (_or) {
              setVal(element, key, _or);
            }
          },
          or(_: number, or: any) {
            _or = or;
            setVal(element, key, or);
          },
        });
        hodors.push(value);
      }
    }
  }

  return hodors;
};
