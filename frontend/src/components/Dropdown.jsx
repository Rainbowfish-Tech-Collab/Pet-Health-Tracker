import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import DropdownButton from "./DropdownButton";
import upperCase from "../utils/upperCase";

/* ------------------------------- COLLAPSIBLE ------------------------------ */
// Smoothly animates open/close using max-height CSS transition.
// Uses a ref to measure scrollHeight of content and sets inline maxHeight to that value when isOpen true, or 0 when false.

const Collapsible = ({ isOpen, children }) => {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  // Measure synchronously to avoid visual jumps and transition the height property.
  useLayoutEffect(() => {
    if (!ref.current) return;
    // when opening, measure content height; when closing, set to 0
    const measured = ref.current.scrollHeight;
    setHeight(isOpen ? measured : 0);
    // Re-run when children change so nested expansions update the parent's height
  }, [isOpen, children]);

  return (
    <div
      ref={ref}
      className="overflow-hidden transition-[height] duration-300 ease-in-out"
      style={{ height: `${height}px` }}
    >
      {children}
    </div>
  );
};

// Helper to make keys for our node trees / maps. These are identifiers for checkboxes.
// Format: CATEGORY.SUBCATEGORY.VALUE (e.g. "stat.Weight.kg" or "activity.Walking")
const makeKey = (...parts) => parts.join("."); // e.g. "stat.Weight.kg"

// Build maps of immediate children and all descendants for each node in the data tree.
// These maps are used to drive checkbox toggling (cascade to descendants, update ancestors).
// The childrenMap allows us to find immediate children of a node to determine if an ancestor should be checked.
// The descendantsMap allows us to find all descendants of a node to and check or uncheck them when a parent is toggled.
const buildMaps = (data) => {
  const childrenMap = {};     // immediate children
  const descendantsMap = {};  // all descendants (flattened)

  const visit = (node, prefix) => {
    // array of leaf values => children are prefix.value
    if (Array.isArray(node)) {
      const direct = node.map((v) => makeKey(prefix, v));

      console.log('direct', direct);
      childrenMap[prefix] = direct;
      descendantsMap[prefix] = [...direct];
      direct.forEach((child) => {
        childrenMap[child] = [];         // leaf has no children
        descendantsMap[child] = [];     // no descendants
      });
      return;
    }

    // object node (stat, medication, etc.)
    if (typeof node === "object" && node !== null) {
      // medication is special: flatten types/dosages into direct children like "medication.aspirin"
      if (prefix === "medication") {
        const flat = [];
        for (const v of Object.values(node)) {
          if (Array.isArray(v)) {
            v.forEach((item) => {
              const child = makeKey(prefix, item);
              flat.push(child);
              childrenMap[child] = [];
              descendantsMap[child] = [];
            });
          }
        }
        childrenMap[prefix] = flat;
        descendantsMap[prefix] = [...flat];
        return;
      }

      // generic object (e.g. stat: { Weight: [...], Glucose: [...], fixed: [...] })
      const direct = [];
      for (const [k, v] of Object.entries(node)) {
        if (k === "fixed") {
          if (Array.isArray(v)) {
            v.forEach((val) => {
              const child = makeKey(prefix, "fixed", val); // e.g. stat.fixed.Heart Rate
              direct.push(child);
              childrenMap[child] = [];
              descendantsMap[child] = [];
            });
          }
        } else {
          const childKey = makeKey(prefix, k); // e.g. stat.Weight
          direct.push(childKey);
          visit(v, childKey); // recurse to build maps for this subtree
        }
      }
      childrenMap[prefix] = direct;

      // build descendants for prefix: include direct and each direct's descendants
      const desc = [];
      for (const d of direct) {
        desc.push(d);
        if (descendantsMap[d]) desc.push(...descendantsMap[d]);
      }
      descendantsMap[prefix] = desc;
      return;
    }

    // fallback: no children
    childrenMap[prefix] = [];
    descendantsMap[prefix] = [];
  };

  Object.entries(data).forEach(([k, v]) => visit(v, k));
  return { childrenMap, descendantsMap };
};


const Dropdown = ({ data, onFilter }) => {
  const [checked, setChecked] = useState({});
  const [expanded, setExpanded] = useState({});
  const [open, setOpen] = useState(false); // top-level collapse for the entire dropdown (start collapsed)
  // activeCount is computed after building the childrenMap so we can exclude ancestor nodes
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) setHeight(open ? ref.current.scrollHeight : 0);
  }, [open, data]); // recalc if data or open changes

  console.log('checked state:', checked);
  // build the maps once for the incoming data so toggles are data-driven and reliable
  const { childrenMap, descendantsMap } = useMemo(() => buildMaps(data), [data]);

  // Count only leaf selections (don't count main ancestors/types). A leaf is a key whose childrenMap entry is an empty array.
  const activeCount = useMemo(() => {
    return Object.entries(checked).filter(([k, v]) => {
      if (!v) return false;
      const children = childrenMap[k];
      // only count if the key exists in childrenMap and has no children (leaf)
      return Array.isArray(children) && children.length === 0;
    }).length;
  }, [checked, childrenMap]);

  console.log('children', childrenMap);
  console.log('descendants', descendantsMap);
  // Toggle a single key (works for parent, subcategory, or leaf).
  // - toggles descendants to same state
  // - updates ancestors to checked=true only if ALL immediate children are checked
  const toggleChild = (path) => {
    setChecked((prev) => {
      const next = { ...prev };
      const isNow = !prev[path];
      next[path] = isNow;

      // cascade to descendants (data-driven)
      const descendants = descendantsMap[path] || [];
      descendants.forEach((d) => (next[d] = isNow));

      // walk/update ancestors (shortest ancestor first -> nearest parent) and update based on immediate children
      const parts = path.split(".");
      for (let i = parts.length - 1; i > 0; i--) {
        const ancestor = parts.slice(0, i).join(".");
        const childKeys = childrenMap[ancestor];
        if (!childKeys) continue; // skip nodes that aren't real parents
        // ancestor is checked only if all its immediate children are checked
        next[ancestor] = childKeys.length > 0 && childKeys.every((ck) => !!next[ck]);
      }

      return next;
    });
  };

  const toggleExpand = (path) => setExpanded((p) => ({ ...p, [path]: !p[path] }));

  // render values (leaf nodes) under a parent path
  const renderValues = (parentPath, values) =>
    values.map((v) => {
      const childKey = makeKey(parentPath, v);
      return (
        <label key={childKey} className="block pl-6 mb-1 cursor-pointer select-none">
          <input
            type="checkbox"
            className="mr-2"
            checked={!!checked[childKey]}
            onChange={() => toggleChild(childKey)}
          />
          {v}
        </label>
      );
    });

  const renderCategory = (category, values) => {
    const parentPath = category;
    const isExpanded = !!expanded[parentPath];

    // const ArrowButton = () => {
    //   return (
    //     <button
    //       className={`material-symbols-rounded text-gray-500 hover:text-gray-700 
    //         transition-transform duration-300 ease-in-out
    //         ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
    //       onClick={() => toggleExpand(parentPath)}
    //     >
    //       play_arrow
    //     </button>
    //   );
    // };

    // Medication: flatten types/dosages under medication
    if (category === "medication" && typeof values === "object") {
      return (
        <div key={category}>
          <div className="flex items-center justify-between">
            <label className="font-semibold cursor-pointer select-none flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={!!checked[parentPath]}
                onChange={() => toggleChild(parentPath)}
              />
              {upperCase(category)}
            </label>
            <DropdownButton
              expanded={isExpanded} // pass the computed boolean from parent
              onClick={() => toggleExpand(parentPath)}
            />
          </div>

          <Collapsible isOpen={isExpanded}>
            <div className="pl-4 space-y-1 ">
              {Object.entries(values).map(([subcat, arr]) => (
                <div key={subcat}>
                  <div className="font-medium mb-1">{subcat}</div>
                  {renderValues(parentPath, arr)}
                </div>
              ))}
            </div>
          </Collapsible>
        </div>
      );
    }

    // Stat: fixed promoted + subcategories
    if (category === "stat" && typeof values === "object") {
      const { fixed, ...rest } = values;
      return (
        <div key={category}>
          <div className="flex items-center justify-between">
            <label className="font-semibold cursor-pointer select-none flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={!!checked[parentPath]}
                onChange={() => toggleChild(parentPath)}
              />
              {upperCase(category)}
            </label>
            <DropdownButton
  expanded={isExpanded} // pass the computed boolean from parent
  onClick={() => toggleExpand(parentPath)}
/>
          </div>

          <Collapsible isOpen={isExpanded}>
            <div className="pl-4 mt-1 space-y-1">
              {Object.entries(rest).map(([key, arr]) => {
                const subPath = makeKey(parentPath, key); // e.g. stat.Weight
                return (
                  <div key={key}>
                    <label className="font-medium cursor-pointer select-none flex items-center mb-1">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={!!checked[subPath]}
                        onChange={() => toggleChild(subPath)}
                      />
                      {upperCase(key)}
                    </label>

                    {/* items under stat.Weight use keys like stat.Weight.kg */}
                    <div>{renderValues(subPath, arr)}</div>
                  </div>
                );
              })}

              {/* fixed promoted values are top-level under stat.fixed.VALUE */}
              {fixed &&
                fixed.map((v) => {
                  const fixedKey = makeKey(parentPath, "fixed", v);
                  return (
                    <label key={fixedKey} className="block font-semibold cursor-pointer select-none mt-1">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={!!checked[fixedKey]}
                        onChange={() => toggleChild(fixedKey)}
                      />
                      {upperCase(v)}
                    </label>
                  );
                })}
            </div>
          </Collapsible>
        </div>
      );
    }

    // Flat arrays (activity, symptom, etc.)
    if (Array.isArray(values)) {
      return (
        <div key={category}>
          <div className="flex items-center justify-between">
            <label className="font-semibold cursor-pointer select-none flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={!!checked[parentPath]}
                onChange={() => toggleChild(parentPath)}
              />
              {upperCase(category)}
            </label>
            <DropdownButton
  expanded={isExpanded} // pass the computed boolean from parent
  onClick={() => toggleExpand(parentPath)}
/>
          </div>

          <Collapsible isOpen={isExpanded}>
            <div className="mt-1 space-y-1">{renderValues(parentPath, values)}</div>
          </Collapsible>
        </div>
      );
    }

    return null;
  };

  // apply and clear handlers
  const handleApply = () => {
    onFilter?.(checked || {});
    // collapse the dropdown after applying
    setOpen(false);
  };

  const handleClear = () => {
    setChecked({});
    onFilter?.({}); // notify parent to clear filters
    // collapse the dropdown after clearing
    setOpen(false);
  };
  
  return (
    <div className="space-y-3">
      {/* Top-level header that toggles the whole dropdown */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 font-semibold select-none cursor-pointer bg-transparent p-0"
        >
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="text-sm text-gray-500">({activeCount})</span>
          )}
        </button>
        <DropdownButton expanded={open} onClick={() => setOpen((o) => !o)} />
      </div>

      {open && (
        <div className="space-y-3">
          {Object.entries(data).map(([k, v]) => renderCategory(k, v))}

          {/* Filter button */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={handleApply}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
