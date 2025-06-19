import { p as push, e as ensure_array_like, a as pop, s as setContext, d as attr_class, c as spread_attributes, g as getContext } from './index3-CcTBkwz9.js';
import { r as run } from './legacy-server-CIa28vFz.js';
import './client-D6jiDWsq.js';
import _$1 from 'lodash-es';
import { b as attr, c as clsx, a as clsx$1, e as escape_html } from './attributes-C9VcdF3X.js';
import { t as twMerge$1 } from './bundle-mjs-BME7zF0Z.js';
import { P as Post } from './Post-sB6g-76_.js';

var l=e=>typeof e=="boolean"?`${e}`:e===0?"0":e,u=e=>!e||typeof e!="object"||Object.keys(e).length===0,x$1=(e,o)=>JSON.stringify(e)===JSON.stringify(o);function i(e,o){e.forEach(function(r){Array.isArray(r)?i(r,o):o.push(r);});}function y(e){let o=[];return i(e,o),o}var a=(...e)=>y(e).filter(Boolean),p=(e,o)=>{let r={},c=Object.keys(e),f=Object.keys(o);for(let t of c)if(f.includes(t)){let s=e[t],n=o[t];Array.isArray(s)||Array.isArray(n)?r[t]=a(n,s):typeof s=="object"&&typeof n=="object"?r[t]=p(s,n):r[t]=n+" "+s;}else r[t]=e[t];for(let t of f)c.includes(t)||(r[t]=o[t]);return r},g=e=>!e||typeof e!="string"?e:e.replace(/\s+/g," ").trim();

const CLASS_PART_SEPARATOR = '-';
const createClassGroupUtils = config => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = className => {
    const classParts = className.split(CLASS_PART_SEPARATOR);
    // Classes like `-inset-1` produce an empty string as first classPart. We assume that classes for negative values are used correctly and remove it from classParts.
    if (classParts[0] === '' && classParts.length !== 1) {
      classParts.shift();
    }
    return getGroupRecursive(classParts, classMap) || getGroupIdForArbitraryProperty(className);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    const conflicts = conflictingClassGroups[classGroupId] || [];
    if (hasPostfixModifier && conflictingClassGroupModifiers[classGroupId]) {
      return [...conflicts, ...conflictingClassGroupModifiers[classGroupId]];
    }
    return conflicts;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
const getGroupRecursive = (classParts, classPartObject) => {
  if (classParts.length === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[0];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  const classGroupFromNextClassPart = nextClassPartObject ? getGroupRecursive(classParts.slice(1), nextClassPartObject) : undefined;
  if (classGroupFromNextClassPart) {
    return classGroupFromNextClassPart;
  }
  if (classPartObject.validators.length === 0) {
    return undefined;
  }
  const classRest = classParts.join(CLASS_PART_SEPARATOR);
  return classPartObject.validators.find(({
    validator
  }) => validator(classRest))?.classGroupId;
};
const arbitraryPropertyRegex = /^\[(.+)\]$/;
const getGroupIdForArbitraryProperty = className => {
  if (arbitraryPropertyRegex.test(className)) {
    const arbitraryPropertyClassName = arbitraryPropertyRegex.exec(className)[1];
    const property = arbitraryPropertyClassName?.substring(0, arbitraryPropertyClassName.indexOf(':'));
    if (property) {
      // I use two dots here because one dot is used as prefix for class groups in plugins
      return 'arbitrary..' + property;
    }
  }
};
/**
 * Exported for testing only
 */
const createClassMap = config => {
  const {
    theme,
    classGroups
  } = config;
  const classMap = {
    nextPart: new Map(),
    validators: []
  };
  for (const classGroupId in classGroups) {
    processClassesRecursively(classGroups[classGroupId], classMap, classGroupId, theme);
  }
  return classMap;
};
const processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  classGroup.forEach(classDefinition => {
    if (typeof classDefinition === 'string') {
      const classPartObjectToEdit = classDefinition === '' ? classPartObject : getPart(classPartObject, classDefinition);
      classPartObjectToEdit.classGroupId = classGroupId;
      return;
    }
    if (typeof classDefinition === 'function') {
      if (isThemeGetter(classDefinition)) {
        processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
        return;
      }
      classPartObject.validators.push({
        validator: classDefinition,
        classGroupId
      });
      return;
    }
    Object.entries(classDefinition).forEach(([key, classGroup]) => {
      processClassesRecursively(classGroup, getPart(classPartObject, key), classGroupId, theme);
    });
  });
};
const getPart = (classPartObject, path) => {
  let currentClassPartObject = classPartObject;
  path.split(CLASS_PART_SEPARATOR).forEach(pathPart => {
    if (!currentClassPartObject.nextPart.has(pathPart)) {
      currentClassPartObject.nextPart.set(pathPart, {
        nextPart: new Map(),
        validators: []
      });
    }
    currentClassPartObject = currentClassPartObject.nextPart.get(pathPart);
  });
  return currentClassPartObject;
};
const isThemeGetter = func => func.isThemeGetter;

// LRU cache inspired from hashlru (https://github.com/dominictarr/hashlru/blob/v1.0.4/index.js) but object replaced with Map to improve performance
const createLruCache = maxCacheSize => {
  if (maxCacheSize < 1) {
    return {
      get: () => undefined,
      set: () => {}
    };
  }
  let cacheSize = 0;
  let cache = new Map();
  let previousCache = new Map();
  const update = (key, value) => {
    cache.set(key, value);
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = new Map();
    }
  };
  return {
    get(key) {
      let value = cache.get(key);
      if (value !== undefined) {
        return value;
      }
      if ((value = previousCache.get(key)) !== undefined) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (cache.has(key)) {
        cache.set(key, value);
      } else {
        update(key, value);
      }
    }
  };
};
const IMPORTANT_MODIFIER = '!';
const MODIFIER_SEPARATOR = ':';
const MODIFIER_SEPARATOR_LENGTH = MODIFIER_SEPARATOR.length;
const createParseClassName = config => {
  const {
    prefix,
    experimentalParseClassName
  } = config;
  /**
   * Parse class name into parts.
   *
   * Inspired by `splitAtTopLevelOnly` used in Tailwind CSS
   * @see https://github.com/tailwindlabs/tailwindcss/blob/v3.2.2/src/util/splitAtTopLevelOnly.js
   */
  let parseClassName = className => {
    const modifiers = [];
    let bracketDepth = 0;
    let parenDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    for (let index = 0; index < className.length; index++) {
      let currentCharacter = className[index];
      if (bracketDepth === 0 && parenDepth === 0) {
        if (currentCharacter === MODIFIER_SEPARATOR) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + MODIFIER_SEPARATOR_LENGTH;
          continue;
        }
        if (currentCharacter === '/') {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === '[') {
        bracketDepth++;
      } else if (currentCharacter === ']') {
        bracketDepth--;
      } else if (currentCharacter === '(') {
        parenDepth++;
      } else if (currentCharacter === ')') {
        parenDepth--;
      }
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.substring(modifierStart);
    const baseClassName = stripImportantModifier(baseClassNameWithImportantModifier);
    const hasImportantModifier = baseClassName !== baseClassNameWithImportantModifier;
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : undefined;
    return {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    };
  };
  if (prefix) {
    const fullPrefix = prefix + MODIFIER_SEPARATOR;
    const parseClassNameOriginal = parseClassName;
    parseClassName = className => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.substring(fullPrefix.length)) : {
      isExternal: true,
      modifiers: [],
      hasImportantModifier: false,
      baseClassName: className,
      maybePostfixModifierPosition: undefined
    };
  }
  if (experimentalParseClassName) {
    const parseClassNameOriginal = parseClassName;
    parseClassName = className => experimentalParseClassName({
      className,
      parseClassName: parseClassNameOriginal
    });
  }
  return parseClassName;
};
const stripImportantModifier = baseClassName => {
  if (baseClassName.endsWith(IMPORTANT_MODIFIER)) {
    return baseClassName.substring(0, baseClassName.length - 1);
  }
  /**
   * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
   * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
   */
  if (baseClassName.startsWith(IMPORTANT_MODIFIER)) {
    return baseClassName.substring(1);
  }
  return baseClassName;
};

/**
 * Sorts modifiers according to following schema:
 * - Predefined modifiers are sorted alphabetically
 * - When an arbitrary variant appears, it must be preserved which modifiers are before and after it
 */
const createSortModifiers = config => {
  const orderSensitiveModifiers = Object.fromEntries(config.orderSensitiveModifiers.map(modifier => [modifier, true]));
  const sortModifiers = modifiers => {
    if (modifiers.length <= 1) {
      return modifiers;
    }
    const sortedModifiers = [];
    let unsortedModifiers = [];
    modifiers.forEach(modifier => {
      const isPositionSensitive = modifier[0] === '[' || orderSensitiveModifiers[modifier];
      if (isPositionSensitive) {
        sortedModifiers.push(...unsortedModifiers.sort(), modifier);
        unsortedModifiers = [];
      } else {
        unsortedModifiers.push(modifier);
      }
    });
    sortedModifiers.push(...unsortedModifiers.sort());
    return sortedModifiers;
  };
  return sortModifiers;
};
const createConfigUtils = config => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  sortModifiers: createSortModifiers(config),
  ...createClassGroupUtils(config)
});
const SPLIT_CLASSES_REGEX = /\s+/;
const mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds,
    sortModifiers
  } = configUtils;
  /**
   * Set of classGroupIds in following format:
   * `{importantModifier}{variantModifiers}{classGroupId}`
   * @example 'float'
   * @example 'hover:focus:bg-color'
   * @example 'md:!pr'
   */
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = '';
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      isExternal,
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    if (isExternal) {
      result = originalClassName + (result.length > 0 ? ' ' + result : result);
      continue;
    }
    let hasPostfixModifier = !!maybePostfixModifierPosition;
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        // Not a Tailwind class
        result = originalClassName + (result.length > 0 ? ' ' + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        // Not a Tailwind class
        result = originalClassName + (result.length > 0 ? ' ' + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = sortModifiers(modifiers).join(':');
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.includes(classId)) {
      // Tailwind class omitted due to conflict
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
      classGroupsInConflict.push(modifierId + group);
    }
    // Tailwind class not in conflict
    result = originalClassName + (result.length > 0 ? ' ' + result : result);
  }
  return result;
};

/**
 * The code in this file is copied from https://github.com/lukeed/clsx and modified to suit the needs of tailwind-merge better.
 *
 * Specifically:
 * - Runtime code from https://github.com/lukeed/clsx/blob/v1.2.1/src/index.js
 * - TypeScript types from https://github.com/lukeed/clsx/blob/v1.2.1/clsx.d.ts
 *
 * Original code has MIT license: Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
 */
function twJoin() {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = '';
  while (index < arguments.length) {
    if (argument = arguments[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
}
const toValue = mix => {
  if (typeof mix === 'string') {
    return mix;
  }
  let resolvedValue;
  let string = '';
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
};
function createTailwindMerge(createConfigFirst, ...createConfigRest) {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall = initTailwindMerge;
  function initTailwindMerge(classList) {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  }
  function tailwindMerge(classList) {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  }
  return function callTailwindMerge() {
    return functionToCall(twJoin.apply(null, arguments));
  };
}
const fromTheme = key => {
  const themeGetter = theme => theme[key] || [];
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
const arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
const arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
const fractionRegex = /^\d+\/\d+$/;
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/;
// Shadow always begins with x and y offset separated by underscore optionally prepended by inset
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
const imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
const isFraction = value => fractionRegex.test(value);
const isNumber = value => Boolean(value) && !Number.isNaN(Number(value));
const isInteger = value => Boolean(value) && Number.isInteger(Number(value));
const isPercent = value => value.endsWith('%') && isNumber(value.slice(0, -1));
const isTshirtSize = value => tshirtUnitRegex.test(value);
const isAny = () => true;
const isLengthOnly = value =>
// `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
// For example, `hsl(0 0% 0%)` would be classified as a length without this check.
// I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
lengthUnitRegex.test(value) && !colorFunctionRegex.test(value);
const isNever = () => false;
const isShadow = value => shadowRegex.test(value);
const isImage = value => imageRegex.test(value);
const isAnyNonArbitrary = value => !isArbitraryValue(value) && !isArbitraryVariable(value);
const isArbitrarySize = value => getIsArbitraryValue(value, isLabelSize, isNever);
const isArbitraryValue = value => arbitraryValueRegex.test(value);
const isArbitraryLength = value => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
const isArbitraryNumber = value => getIsArbitraryValue(value, isLabelNumber, isNumber);
const isArbitraryPosition = value => getIsArbitraryValue(value, isLabelPosition, isNever);
const isArbitraryImage = value => getIsArbitraryValue(value, isLabelImage, isImage);
const isArbitraryShadow = value => getIsArbitraryValue(value, isNever, isShadow);
const isArbitraryVariable = value => arbitraryVariableRegex.test(value);
const isArbitraryVariableLength = value => getIsArbitraryVariable(value, isLabelLength);
const isArbitraryVariableFamilyName = value => getIsArbitraryVariable(value, isLabelFamilyName);
const isArbitraryVariablePosition = value => getIsArbitraryVariable(value, isLabelPosition);
const isArbitraryVariableSize = value => getIsArbitraryVariable(value, isLabelSize);
const isArbitraryVariableImage = value => getIsArbitraryVariable(value, isLabelImage);
const isArbitraryVariableShadow = value => getIsArbitraryVariable(value, isLabelShadow, true);
// Helpers
const getIsArbitraryValue = (value, testLabel, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
const getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
  const result = arbitraryVariableRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return shouldMatchNoLabel;
  }
  return false;
};
// Labels
const isLabelPosition = label => label === 'position';
const imageLabels = /*#__PURE__*/new Set(['image', 'url']);
const isLabelImage = label => imageLabels.has(label);
const sizeLabels = /*#__PURE__*/new Set(['length', 'size', 'percentage']);
const isLabelSize = label => sizeLabels.has(label);
const isLabelLength = label => label === 'length';
const isLabelNumber = label => label === 'number';
const isLabelFamilyName = label => label === 'family-name';
const isLabelShadow = label => label === 'shadow';
const getDefaultConfig = () => {
  /**
   * Theme getters for theme variable namespaces
   * @see https://tailwindcss.com/docs/theme#theme-variable-namespaces
   */
  /***/
  const themeColor = fromTheme('color');
  const themeFont = fromTheme('font');
  const themeText = fromTheme('text');
  const themeFontWeight = fromTheme('font-weight');
  const themeTracking = fromTheme('tracking');
  const themeLeading = fromTheme('leading');
  const themeBreakpoint = fromTheme('breakpoint');
  const themeContainer = fromTheme('container');
  const themeSpacing = fromTheme('spacing');
  const themeRadius = fromTheme('radius');
  const themeShadow = fromTheme('shadow');
  const themeInsetShadow = fromTheme('inset-shadow');
  const themeDropShadow = fromTheme('drop-shadow');
  const themeBlur = fromTheme('blur');
  const themePerspective = fromTheme('perspective');
  const themeAspect = fromTheme('aspect');
  const themeEase = fromTheme('ease');
  const themeAnimate = fromTheme('animate');
  /**
   * Helpers to avoid repeating the same scales
   *
   * We use functions that create a new array every time they're called instead of static arrays.
   * This ensures that users who modify any scale by mutating the array (e.g. with `array.push(element)`) don't accidentally mutate arrays in other parts of the config.
   */
  /***/
  const scaleBreak = () => ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'];
  const scalePosition = () => ['bottom', 'center', 'left', 'left-bottom', 'left-top', 'right', 'right-bottom', 'right-top', 'top'];
  const scaleOverflow = () => ['auto', 'hidden', 'clip', 'visible', 'scroll'];
  const scaleOverscroll = () => ['auto', 'contain', 'none'];
  const scaleUnambiguousSpacing = () => [isArbitraryVariable, isArbitraryValue, themeSpacing];
  const scaleInset = () => [isFraction, 'full', 'auto', ...scaleUnambiguousSpacing()];
  const scaleGridTemplateColsRows = () => [isInteger, 'none', 'subgrid', isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartAndEnd = () => ['auto', {
    span: ['full', isInteger, isArbitraryVariable, isArbitraryValue]
  }, isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartOrEnd = () => [isInteger, 'auto', isArbitraryVariable, isArbitraryValue];
  const scaleGridAutoColsRows = () => ['auto', 'min', 'max', 'fr', isArbitraryVariable, isArbitraryValue];
  const scaleAlignPrimaryAxis = () => ['start', 'end', 'center', 'between', 'around', 'evenly', 'stretch', 'baseline'];
  const scaleAlignSecondaryAxis = () => ['start', 'end', 'center', 'stretch'];
  const scaleMargin = () => ['auto', ...scaleUnambiguousSpacing()];
  const scaleSizing = () => [isFraction, 'auto', 'full', 'dvw', 'dvh', 'lvw', 'lvh', 'svw', 'svh', 'min', 'max', 'fit', ...scaleUnambiguousSpacing()];
  const scaleColor = () => [themeColor, isArbitraryVariable, isArbitraryValue];
  const scaleGradientStopPosition = () => [isPercent, isArbitraryLength];
  const scaleRadius = () => [
  // Deprecated since Tailwind CSS v4.0.0
  '', 'none', 'full', themeRadius, isArbitraryVariable, isArbitraryValue];
  const scaleBorderWidth = () => ['', isNumber, isArbitraryVariableLength, isArbitraryLength];
  const scaleLineStyle = () => ['solid', 'dashed', 'dotted', 'double'];
  const scaleBlendMode = () => ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];
  const scaleBlur = () => [
  // Deprecated since Tailwind CSS v4.0.0
  '', 'none', themeBlur, isArbitraryVariable, isArbitraryValue];
  const scaleOrigin = () => ['center', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left', isArbitraryVariable, isArbitraryValue];
  const scaleRotate = () => ['none', isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleScale = () => ['none', isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleSkew = () => [isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleTranslate = () => [isFraction, 'full', ...scaleUnambiguousSpacing()];
  return {
    cacheSize: 500,
    theme: {
      animate: ['spin', 'ping', 'pulse', 'bounce'],
      aspect: ['video'],
      blur: [isTshirtSize],
      breakpoint: [isTshirtSize],
      color: [isAny],
      container: [isTshirtSize],
      'drop-shadow': [isTshirtSize],
      ease: ['in', 'out', 'in-out'],
      font: [isAnyNonArbitrary],
      'font-weight': ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
      'inset-shadow': [isTshirtSize],
      leading: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'],
      perspective: ['dramatic', 'near', 'normal', 'midrange', 'distant', 'none'],
      radius: [isTshirtSize],
      shadow: [isTshirtSize],
      spacing: ['px', isNumber],
      text: [isTshirtSize],
      tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest']
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ['auto', 'square', isFraction, isArbitraryValue, isArbitraryVariable, themeAspect]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ['container'],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isNumber, isArbitraryValue, isArbitraryVariable, themeContainer]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      'break-after': [{
        'break-after': scaleBreak()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      'break-before': [{
        'break-before': scaleBreak()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      'break-inside': [{
        'break-inside': ['auto', 'avoid', 'avoid-page', 'avoid-column']
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      'box-decoration': [{
        'box-decoration': ['slice', 'clone']
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ['border', 'content']
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid', 'contents', 'list-item', 'hidden'],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ['sr-only', 'not-sr-only'],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ['right', 'left', 'none', 'start', 'end']
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ['left', 'right', 'both', 'none', 'start', 'end']
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ['isolate', 'isolation-auto'],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      'object-fit': [{
        object: ['contain', 'cover', 'fill', 'none', 'scale-down']
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      'object-position': [{
        object: [...scalePosition(), isArbitraryValue, isArbitraryVariable]
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: scaleOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-x': [{
        'overflow-x': scaleOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-y': [{
        'overflow-y': scaleOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: scaleOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-x': [{
        'overscroll-x': scaleOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-y': [{
        'overscroll-y': scaleOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ['static', 'fixed', 'absolute', 'relative', 'sticky'],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: scaleInset()
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-x': [{
        'inset-x': scaleInset()
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-y': [{
        'inset-y': scaleInset()
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: scaleInset()
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: scaleInset()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: scaleInset()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: scaleInset()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: scaleInset()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: scaleInset()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ['visible', 'invisible', 'collapse'],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [isInteger, 'auto', isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [isFraction, 'full', 'auto', themeContainer, ...scaleUnambiguousSpacing()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      'flex-direction': [{
        flex: ['row', 'row-reverse', 'col', 'col-reverse']
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      'flex-wrap': [{
        flex: ['nowrap', 'wrap', 'wrap-reverse']
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [isNumber, isFraction, 'auto', 'initial', 'none', isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [isInteger, 'first', 'last', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      'grid-cols': [{
        'grid-cols': scaleGridTemplateColsRows()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start-end': [{
        col: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start': [{
        'col-start': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-end': [{
        'col-end': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      'grid-rows': [{
        'grid-rows': scaleGridTemplateColsRows()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start-end': [{
        row: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start': [{
        'row-start': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-end': [{
        'row-end': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      'grid-flow': [{
        'grid-flow': ['row', 'col', 'dense', 'row-dense', 'col-dense']
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      'auto-cols': [{
        'auto-cols': scaleGridAutoColsRows()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      'auto-rows': [{
        'auto-rows': scaleGridAutoColsRows()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: scaleUnambiguousSpacing()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-x': [{
        'gap-x': scaleUnambiguousSpacing()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-y': [{
        'gap-y': scaleUnambiguousSpacing()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      'justify-content': [{
        justify: [...scaleAlignPrimaryAxis(), 'normal']
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      'justify-items': [{
        'justify-items': [...scaleAlignSecondaryAxis(), 'normal']
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      'justify-self': [{
        'justify-self': ['auto', ...scaleAlignSecondaryAxis()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      'align-content': [{
        content: ['normal', ...scaleAlignPrimaryAxis()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      'align-items': [{
        items: [...scaleAlignSecondaryAxis(), 'baseline']
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      'align-self': [{
        self: ['auto', ...scaleAlignSecondaryAxis(), 'baseline']
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      'place-content': [{
        'place-content': scaleAlignPrimaryAxis()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      'place-items': [{
        'place-items': [...scaleAlignSecondaryAxis(), 'baseline']
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      'place-self': [{
        'place-self': ['auto', ...scaleAlignSecondaryAxis()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: scaleUnambiguousSpacing()
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: scaleUnambiguousSpacing()
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: scaleUnambiguousSpacing()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: scaleMargin()
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: scaleMargin()
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: scaleMargin()
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: scaleMargin()
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: scaleMargin()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: scaleMargin()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: scaleMargin()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: scaleMargin()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: scaleMargin()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-x': [{
        'space-x': scaleUnambiguousSpacing()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-x-reverse': ['space-x-reverse'],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-y': [{
        'space-y': scaleUnambiguousSpacing()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-y-reverse': ['space-y-reverse'],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: scaleSizing()
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [themeContainer, 'screen', ...scaleSizing()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      'min-w': [{
        'min-w': [themeContainer, 'screen', /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        'none', ...scaleSizing()]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      'max-w': [{
        'max-w': [themeContainer, 'screen', 'none', /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        'prose', /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        {
          screen: [themeBreakpoint]
        }, ...scaleSizing()]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ['screen', ...scaleSizing()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      'min-h': [{
        'min-h': ['screen', 'none', ...scaleSizing()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      'max-h': [{
        'max-h': ['screen', ...scaleSizing()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      'font-size': [{
        text: ['base', themeText, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      'font-smoothing': ['antialiased', 'subpixel-antialiased'],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      'font-style': ['italic', 'not-italic'],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      'font-weight': [{
        font: [themeFontWeight, isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      'font-stretch': [{
        'font-stretch': ['ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'normal', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded', isPercent, isArbitraryValue]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      'font-family': [{
        font: [isArbitraryVariableFamilyName, isArbitraryValue, themeFont]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-normal': ['normal-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-ordinal': ['ordinal'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-slashed-zero': ['slashed-zero'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-figure': ['lining-nums', 'oldstyle-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-spacing': ['proportional-nums', 'tabular-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-fraction': ['diagonal-fractions', 'stacked-fractions'],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [themeTracking, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      'line-clamp': [{
        'line-clamp': [isNumber, 'none', isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [/** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        themeLeading, ...scaleUnambiguousSpacing()]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      'list-image': [{
        'list-image': ['none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      'list-style-position': [{
        list: ['inside', 'outside']
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      'list-style-type': [{
        list: ['disc', 'decimal', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      'text-alignment': [{
        text: ['left', 'center', 'right', 'justify', 'start', 'end']
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      'placeholder-color': [{
        placeholder: scaleColor()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      'text-color': [{
        text: scaleColor()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      'text-decoration': ['underline', 'overline', 'line-through', 'no-underline'],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      'text-decoration-style': [{
        decoration: [...scaleLineStyle(), 'wavy']
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      'text-decoration-thickness': [{
        decoration: [isNumber, 'from-font', 'auto', isArbitraryVariable, isArbitraryLength]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      'text-decoration-color': [{
        decoration: scaleColor()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      'underline-offset': [{
        'underline-offset': [isNumber, 'auto', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      'text-transform': ['uppercase', 'lowercase', 'capitalize', 'normal-case'],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      'text-overflow': ['truncate', 'text-ellipsis', 'text-clip'],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      'text-wrap': [{
        text: ['wrap', 'nowrap', 'balance', 'pretty']
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: scaleUnambiguousSpacing()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      'vertical-align': [{
        align: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces']
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ['normal', 'words', 'all', 'keep']
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ['none', 'manual', 'auto']
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ['none', isArbitraryVariable, isArbitraryValue]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      'bg-attachment': [{
        bg: ['fixed', 'local', 'scroll']
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      'bg-clip': [{
        'bg-clip': ['border', 'padding', 'content', 'text']
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      'bg-origin': [{
        'bg-origin': ['border', 'padding', 'content']
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      'bg-position': [{
        bg: [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition]
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      'bg-repeat': [{
        bg: ['no-repeat', {
          repeat: ['', 'x', 'y', 'space', 'round']
        }]
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      'bg-size': [{
        bg: ['auto', 'cover', 'contain', isArbitraryVariableSize, isArbitrarySize]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      'bg-image': [{
        bg: ['none', {
          linear: [{
            to: ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl']
          }, isInteger, isArbitraryVariable, isArbitraryValue],
          radial: ['', isArbitraryVariable, isArbitraryValue],
          conic: [isInteger, isArbitraryVariable, isArbitraryValue]
        }, isArbitraryVariableImage, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      'bg-color': [{
        bg: scaleColor()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from-pos': [{
        from: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via-pos': [{
        via: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to-pos': [{
        to: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from': [{
        from: scaleColor()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via': [{
        via: scaleColor()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to': [{
        to: scaleColor()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: scaleRadius()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-s': [{
        'rounded-s': scaleRadius()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-e': [{
        'rounded-e': scaleRadius()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-t': [{
        'rounded-t': scaleRadius()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-r': [{
        'rounded-r': scaleRadius()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-b': [{
        'rounded-b': scaleRadius()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-l': [{
        'rounded-l': scaleRadius()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ss': [{
        'rounded-ss': scaleRadius()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-se': [{
        'rounded-se': scaleRadius()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ee': [{
        'rounded-ee': scaleRadius()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-es': [{
        'rounded-es': scaleRadius()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tl': [{
        'rounded-tl': scaleRadius()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tr': [{
        'rounded-tr': scaleRadius()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-br': [{
        'rounded-br': scaleRadius()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-bl': [{
        'rounded-bl': scaleRadius()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w': [{
        border: scaleBorderWidth()
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-x': [{
        'border-x': scaleBorderWidth()
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-y': [{
        'border-y': scaleBorderWidth()
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-s': [{
        'border-s': scaleBorderWidth()
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-e': [{
        'border-e': scaleBorderWidth()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-t': [{
        'border-t': scaleBorderWidth()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-r': [{
        'border-r': scaleBorderWidth()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-b': [{
        'border-b': scaleBorderWidth()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-l': [{
        'border-l': scaleBorderWidth()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-x': [{
        'divide-x': scaleBorderWidth()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-x-reverse': ['divide-x-reverse'],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-y': [{
        'divide-y': scaleBorderWidth()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-y-reverse': ['divide-y-reverse'],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      'border-style': [{
        border: [...scaleLineStyle(), 'hidden', 'none']
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      'divide-style': [{
        divide: [...scaleLineStyle(), 'hidden', 'none']
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color': [{
        border: scaleColor()
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-x': [{
        'border-x': scaleColor()
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-y': [{
        'border-y': scaleColor()
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-s': [{
        'border-s': scaleColor()
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-e': [{
        'border-e': scaleColor()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-t': [{
        'border-t': scaleColor()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-r': [{
        'border-r': scaleColor()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-b': [{
        'border-b': scaleColor()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-l': [{
        'border-l': scaleColor()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      'divide-color': [{
        divide: scaleColor()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      'outline-style': [{
        outline: [...scaleLineStyle(), 'none', 'hidden']
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      'outline-offset': [{
        'outline-offset': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      'outline-w': [{
        outline: ['', isNumber, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      'outline-color': [{
        outline: [themeColor]
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
        // Deprecated since Tailwind CSS v4.0.0
        '', 'none', themeShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      'shadow-color': [{
        shadow: scaleColor()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      'inset-shadow': [{
        'inset-shadow': ['none', isArbitraryVariable, isArbitraryValue, themeInsetShadow]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      'inset-shadow-color': [{
        'inset-shadow': scaleColor()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      'ring-w': [{
        ring: scaleBorderWidth()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      'ring-w-inset': ['ring-inset'],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      'ring-color': [{
        ring: scaleColor()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      'ring-offset-w': [{
        'ring-offset': [isNumber, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      'ring-offset-color': [{
        'ring-offset': scaleColor()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      'inset-ring-w': [{
        'inset-ring': scaleBorderWidth()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      'inset-ring-color': [{
        'inset-ring': scaleColor()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      'mix-blend': [{
        'mix-blend': [...scaleBlendMode(), 'plus-darker', 'plus-lighter']
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      'bg-blend': [{
        'bg-blend': scaleBlendMode()
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
        // Deprecated since Tailwind CSS v3.0.0
        '', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: scaleBlur()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      'drop-shadow': [{
        'drop-shadow': [
        // Deprecated since Tailwind CSS v4.0.0
        '', 'none', themeDropShadow, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      'hue-rotate': [{
        'hue-rotate': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      'backdrop-filter': [{
        'backdrop-filter': [
        // Deprecated since Tailwind CSS v3.0.0
        '', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      'backdrop-blur': [{
        'backdrop-blur': scaleBlur()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      'backdrop-brightness': [{
        'backdrop-brightness': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      'backdrop-contrast': [{
        'backdrop-contrast': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      'backdrop-grayscale': [{
        'backdrop-grayscale': ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      'backdrop-hue-rotate': [{
        'backdrop-hue-rotate': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      'backdrop-invert': [{
        'backdrop-invert': ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      'backdrop-opacity': [{
        'backdrop-opacity': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      'backdrop-saturate': [{
        'backdrop-saturate': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      'backdrop-sepia': [{
        'backdrop-sepia': ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      'border-collapse': [{
        border: ['collapse', 'separate']
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing': [{
        'border-spacing': scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-x': [{
        'border-spacing-x': scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-y': [{
        'border-spacing-y': scaleUnambiguousSpacing()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      'table-layout': [{
        table: ['auto', 'fixed']
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ['top', 'bottom']
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ['', 'all', 'colors', 'opacity', 'shadow', 'transform', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      'transition-behavior': [{
        transition: ['normal', 'discrete']
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [isNumber, 'initial', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ['linear', 'initial', themeEase, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ['none', themeAnimate, isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ['hidden', 'visible']
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [themePerspective, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      'perspective-origin': [{
        'perspective-origin': scaleOrigin()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: scaleRotate()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      'rotate-x': [{
        'rotate-x': scaleRotate()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      'rotate-y': [{
        'rotate-y': scaleRotate()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      'rotate-z': [{
        'rotate-z': scaleRotate()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: scaleScale()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-x': [{
        'scale-x': scaleScale()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-y': [{
        'scale-y': scaleScale()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-z': [{
        'scale-z': scaleScale()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-3d': ['scale-3d'],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: scaleSkew()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-x': [{
        'skew-x': scaleSkew()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-y': [{
        'skew-y': scaleSkew()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [isArbitraryVariable, isArbitraryValue, '', 'none', 'gpu', 'cpu']
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      'transform-origin': [{
        origin: scaleOrigin()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      'transform-style': [{
        transform: ['3d', 'flat']
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: scaleTranslate()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-x': [{
        'translate-x': scaleTranslate()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-y': [{
        'translate-y': scaleTranslate()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-z': [{
        'translate-z': scaleTranslate()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-none': ['translate-none'],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: scaleColor()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ['none', 'auto']
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      'caret-color': [{
        caret: scaleColor()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      'color-scheme': [{
        scheme: ['normal', 'dark', 'light', 'light-dark', 'only-dark', 'only-light']
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'context-menu', 'progress', 'cell', 'crosshair', 'vertical-text', 'alias', 'copy', 'no-drop', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      'field-sizing': [{
        'field-sizing': ['fixed', 'content']
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      'pointer-events': [{
        'pointer-events': ['auto', 'none']
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ['none', '', 'y', 'x']
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      'scroll-behavior': [{
        scroll: ['auto', 'smooth']
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-m': [{
        'scroll-m': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mx': [{
        'scroll-mx': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-my': [{
        'scroll-my': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ms': [{
        'scroll-ms': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-me': [{
        'scroll-me': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mt': [{
        'scroll-mt': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mr': [{
        'scroll-mr': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mb': [{
        'scroll-mb': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ml': [{
        'scroll-ml': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-p': [{
        'scroll-p': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-px': [{
        'scroll-px': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-py': [{
        'scroll-py': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-ps': [{
        'scroll-ps': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pe': [{
        'scroll-pe': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pt': [{
        'scroll-pt': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pr': [{
        'scroll-pr': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pb': [{
        'scroll-pb': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pl': [{
        'scroll-pl': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      'snap-align': [{
        snap: ['start', 'end', 'center', 'align-none']
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      'snap-stop': [{
        snap: ['normal', 'always']
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-type': [{
        snap: ['none', 'x', 'y', 'both']
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-strictness': [{
        snap: ['mandatory', 'proximity']
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ['auto', 'none', 'manipulation']
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-x': [{
        'touch-pan': ['x', 'left', 'right']
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-y': [{
        'touch-pan': ['y', 'up', 'down']
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-pz': ['touch-pinch-zoom'],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ['none', 'text', 'all', 'auto']
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      'will-change': [{
        'will-change': ['auto', 'scroll', 'contents', 'transform', isArbitraryVariable, isArbitraryValue]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ['none', ...scaleColor()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      'stroke-w': [{
        stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ['none', ...scaleColor()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      'forced-color-adjust': [{
        'forced-color-adjust': ['auto', 'none']
      }]
    },
    conflictingClassGroups: {
      overflow: ['overflow-x', 'overflow-y'],
      overscroll: ['overscroll-x', 'overscroll-y'],
      inset: ['inset-x', 'inset-y', 'start', 'end', 'top', 'right', 'bottom', 'left'],
      'inset-x': ['right', 'left'],
      'inset-y': ['top', 'bottom'],
      flex: ['basis', 'grow', 'shrink'],
      gap: ['gap-x', 'gap-y'],
      p: ['px', 'py', 'ps', 'pe', 'pt', 'pr', 'pb', 'pl'],
      px: ['pr', 'pl'],
      py: ['pt', 'pb'],
      m: ['mx', 'my', 'ms', 'me', 'mt', 'mr', 'mb', 'ml'],
      mx: ['mr', 'ml'],
      my: ['mt', 'mb'],
      size: ['w', 'h'],
      'font-size': ['leading'],
      'fvn-normal': ['fvn-ordinal', 'fvn-slashed-zero', 'fvn-figure', 'fvn-spacing', 'fvn-fraction'],
      'fvn-ordinal': ['fvn-normal'],
      'fvn-slashed-zero': ['fvn-normal'],
      'fvn-figure': ['fvn-normal'],
      'fvn-spacing': ['fvn-normal'],
      'fvn-fraction': ['fvn-normal'],
      'line-clamp': ['display', 'overflow'],
      rounded: ['rounded-s', 'rounded-e', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l', 'rounded-ss', 'rounded-se', 'rounded-ee', 'rounded-es', 'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl'],
      'rounded-s': ['rounded-ss', 'rounded-es'],
      'rounded-e': ['rounded-se', 'rounded-ee'],
      'rounded-t': ['rounded-tl', 'rounded-tr'],
      'rounded-r': ['rounded-tr', 'rounded-br'],
      'rounded-b': ['rounded-br', 'rounded-bl'],
      'rounded-l': ['rounded-tl', 'rounded-bl'],
      'border-spacing': ['border-spacing-x', 'border-spacing-y'],
      'border-w': ['border-w-s', 'border-w-e', 'border-w-t', 'border-w-r', 'border-w-b', 'border-w-l'],
      'border-w-x': ['border-w-r', 'border-w-l'],
      'border-w-y': ['border-w-t', 'border-w-b'],
      'border-color': ['border-color-s', 'border-color-e', 'border-color-t', 'border-color-r', 'border-color-b', 'border-color-l'],
      'border-color-x': ['border-color-r', 'border-color-l'],
      'border-color-y': ['border-color-t', 'border-color-b'],
      translate: ['translate-x', 'translate-y', 'translate-none'],
      'translate-none': ['translate', 'translate-x', 'translate-y', 'translate-z'],
      'scroll-m': ['scroll-mx', 'scroll-my', 'scroll-ms', 'scroll-me', 'scroll-mt', 'scroll-mr', 'scroll-mb', 'scroll-ml'],
      'scroll-mx': ['scroll-mr', 'scroll-ml'],
      'scroll-my': ['scroll-mt', 'scroll-mb'],
      'scroll-p': ['scroll-px', 'scroll-py', 'scroll-ps', 'scroll-pe', 'scroll-pt', 'scroll-pr', 'scroll-pb', 'scroll-pl'],
      'scroll-px': ['scroll-pr', 'scroll-pl'],
      'scroll-py': ['scroll-pt', 'scroll-pb'],
      touch: ['touch-x', 'touch-y', 'touch-pz'],
      'touch-x': ['touch'],
      'touch-y': ['touch'],
      'touch-pz': ['touch']
    },
    conflictingClassGroupModifiers: {
      'font-size': ['leading']
    },
    orderSensitiveModifiers: ['before', 'after', 'placeholder', 'file', 'marker', 'selection', 'first-line', 'first-letter', 'backdrop', '*', '**']
  };
};

/**
 * @param baseConfig Config where other config will be merged into. This object will be mutated.
 * @param configExtension Partial config to merge into the `baseConfig`.
 */
const mergeConfigs = (baseConfig, {
  cacheSize,
  prefix,
  experimentalParseClassName,
  extend = {},
  override = {}
}) => {
  overrideProperty(baseConfig, 'cacheSize', cacheSize);
  overrideProperty(baseConfig, 'prefix', prefix);
  overrideProperty(baseConfig, 'experimentalParseClassName', experimentalParseClassName);
  overrideConfigProperties(baseConfig.theme, override.theme);
  overrideConfigProperties(baseConfig.classGroups, override.classGroups);
  overrideConfigProperties(baseConfig.conflictingClassGroups, override.conflictingClassGroups);
  overrideConfigProperties(baseConfig.conflictingClassGroupModifiers, override.conflictingClassGroupModifiers);
  overrideProperty(baseConfig, 'orderSensitiveModifiers', override.orderSensitiveModifiers);
  mergeConfigProperties(baseConfig.theme, extend.theme);
  mergeConfigProperties(baseConfig.classGroups, extend.classGroups);
  mergeConfigProperties(baseConfig.conflictingClassGroups, extend.conflictingClassGroups);
  mergeConfigProperties(baseConfig.conflictingClassGroupModifiers, extend.conflictingClassGroupModifiers);
  mergeArrayProperties(baseConfig, extend, 'orderSensitiveModifiers');
  return baseConfig;
};
const overrideProperty = (baseObject, overrideKey, overrideValue) => {
  if (overrideValue !== undefined) {
    baseObject[overrideKey] = overrideValue;
  }
};
const overrideConfigProperties = (baseObject, overrideObject) => {
  if (overrideObject) {
    for (const key in overrideObject) {
      overrideProperty(baseObject, key, overrideObject[key]);
    }
  }
};
const mergeConfigProperties = (baseObject, mergeObject) => {
  if (mergeObject) {
    for (const key in mergeObject) {
      mergeArrayProperties(baseObject, mergeObject, key);
    }
  }
};
const mergeArrayProperties = (baseObject, mergeObject, key) => {
  const mergeValue = mergeObject[key];
  if (mergeValue !== undefined) {
    baseObject[key] = baseObject[key] ? baseObject[key].concat(mergeValue) : mergeValue;
  }
};
const extendTailwindMerge = (configExtension, ...createConfig) => typeof configExtension === 'function' ? createTailwindMerge(getDefaultConfig, configExtension, ...createConfig) : createTailwindMerge(() => mergeConfigs(getDefaultConfig(), configExtension), ...createConfig);
const twMerge = /*#__PURE__*/createTailwindMerge(getDefaultConfig);

var ie={twMerge:true,twMergeConfig:{},responsiveVariants:false},x=s=>s||void 0,N=(...s)=>x(y(s).filter(Boolean).join(" ")),R=null,v={},q=false,M=(...s)=>b$1=>b$1.twMerge?((!R||q)&&(q=false,R=u(v)?twMerge:extendTailwindMerge({...v,extend:{theme:v.theme,classGroups:v.classGroups,conflictingClassGroupModifiers:v.conflictingClassGroupModifiers,conflictingClassGroups:v.conflictingClassGroups,...v.extend}})),x(R(N(s)))):N(s),_=(s,b)=>{for(let e in b)s.hasOwnProperty(e)?s[e]=N(s[e],b[e]):s[e]=b[e];return s},ce=(s,b$1)=>{let{extend:e=null,slots:O={},variants:U={},compoundVariants:W=[],compoundSlots:C=[],defaultVariants:z={}}=s,m={...ie,...b$1},k=e!=null&&e.base?N(e.base,s==null?void 0:s.base):s==null?void 0:s.base,g$1=e!=null&&e.variants&&!u(e.variants)?p(U,e.variants):U,w=e!=null&&e.defaultVariants&&!u(e.defaultVariants)?{...e.defaultVariants,...z}:z;!u(m.twMergeConfig)&&!x$1(m.twMergeConfig,v)&&(q=true,v=m.twMergeConfig);let S=u(e==null?void 0:e.slots),T=u(O)?{}:{base:N(s==null?void 0:s.base,S&&(e==null?void 0:e.base)),...O},j=S?T:_({...e==null?void 0:e.slots},u(T)?{base:s==null?void 0:s.base}:T),h$1=u(e==null?void 0:e.compoundVariants)?W:a(e==null?void 0:e.compoundVariants,W),V=l$1=>{if(u(g$1)&&u(O)&&S)return M(k,l$1==null?void 0:l$1.class,l$1==null?void 0:l$1.className)(m);if(h$1&&!Array.isArray(h$1))throw new TypeError(`The "compoundVariants" prop must be an array. Received: ${typeof h$1}`);if(C&&!Array.isArray(C))throw new TypeError(`The "compoundSlots" prop must be an array. Received: ${typeof C}`);let P=(a,n,t=[],i)=>{let r=t;if(typeof n=="string")r=r.concat(g(n).split(" ").map(o=>`${a}:${o}`));else if(Array.isArray(n))r=r.concat(n.reduce((o,c)=>o.concat(`${a}:${c}`),[]));else if(typeof n=="object"&&typeof i=="string"){for(let o in n)if(n.hasOwnProperty(o)&&o===i){let c=n[o];if(c&&typeof c=="string"){let u=g(c);r[i]?r[i]=r[i].concat(u.split(" ").map(f=>`${a}:${f}`)):r[i]=u.split(" ").map(f=>`${a}:${f}`);}else Array.isArray(c)&&c.length>0&&(r[i]=c.reduce((u,f)=>u.concat(`${a}:${f}`),[]));}}return r},D=(a$1,n=g$1,t=null,i=null)=>{var L;let r=n[a$1];if(!r||u(r))return null;let o=(L=i==null?void 0:i[a$1])!=null?L:l$1==null?void 0:l$1[a$1];if(o===null)return null;let c=l(o),u$1=Array.isArray(m.responsiveVariants)&&m.responsiveVariants.length>0||m.responsiveVariants===true,f=w==null?void 0:w[a$1],d=[];if(typeof c=="object"&&u$1)for(let[E,Q]of Object.entries(c)){let ne=r[Q];if(E==="initial"){f=Q;continue}Array.isArray(m.responsiveVariants)&&!m.responsiveVariants.includes(E)||(d=P(E,ne,d,t));}let $=c!=null&&typeof c!="object"?c:l(f),A=r[$||"false"];return typeof d=="object"&&typeof t=="string"&&d[t]?_(d,A):d.length>0?(d.push(A),t==="base"?d.join(" "):d):A},p=()=>g$1?Object.keys(g$1).map(a=>D(a,g$1)):null,ee=(a,n)=>{if(!g$1||typeof g$1!="object")return null;let t=new Array;for(let i in g$1){let r=D(i,g$1,a,n),o=a==="base"&&typeof r=="string"?r:r&&r[a];o&&(t[t.length]=o);}return t},H={};for(let a in l$1)l$1[a]!==void 0&&(H[a]=l$1[a]);let I=(a,n)=>{var i;let t=typeof(l$1==null?void 0:l$1[a])=="object"?{[a]:(i=l$1[a])==null?void 0:i.initial}:{};return {...w,...H,...t,...n}},J=(a=[],n)=>{let t=[];for(let{class:i,className:r,...o}of a){let c=true;for(let[u,f]of Object.entries(o)){let d=I(u,n)[u];if(Array.isArray(f)){if(!f.includes(d)){c=false;break}}else {let $=A=>A==null||A===false;if($(f)&&$(d))continue;if(d!==f){c=false;break}}}c&&(i&&t.push(i),r&&t.push(r));}return t},te=a=>{let n=J(h$1,a);if(!Array.isArray(n))return n;let t={};for(let i of n)if(typeof i=="string"&&(t.base=M(t.base,i)(m)),typeof i=="object")for(let[r,o]of Object.entries(i))t[r]=M(t[r],o)(m);return t},ae=a=>{if(C.length<1)return null;let n={};for(let{slots:t=[],class:i,className:r,...o}of C){if(!u(o)){let c=true;for(let u of Object.keys(o)){let f=I(u,a)[u];if(f===void 0||(Array.isArray(o[u])?!o[u].includes(f):o[u]!==f)){c=false;break}}if(!c)continue}for(let c of t)n[c]=n[c]||[],n[c].push([i,r]);}return n};if(!u(O)||!S){let a={};if(typeof j=="object"&&!u(j))for(let n of Object.keys(j))a[n]=t=>{var i,r;return M(j[n],ee(n,t),((i=te(t))!=null?i:[])[n],((r=ae(t))!=null?r:[])[n],t==null?void 0:t.class,t==null?void 0:t.className)(m)};return a}return M(k,p(),J(h$1),l$1==null?void 0:l$1.class,l$1==null?void 0:l$1.className)(m)},K=()=>{if(!(!g$1||typeof g$1!="object"))return Object.keys(g$1)};return V.variantKeys=K(),V.extend=e,V.base=k,V.slots=j,V.variants=g$1,V.defaultVariants=w,V.compoundSlots=C,V.compoundVariants=h$1,V};

var cjs;
var hasRequiredCjs;

function requireCjs () {
	if (hasRequiredCjs) return cjs;
	hasRequiredCjs = 1;

	var isMergeableObject = function isMergeableObject(value) {
		return isNonNullObject(value)
			&& !isSpecial(value)
	};

	function isNonNullObject(value) {
		return !!value && typeof value === 'object'
	}

	function isSpecial(value) {
		var stringValue = Object.prototype.toString.call(value);

		return stringValue === '[object RegExp]'
			|| stringValue === '[object Date]'
			|| isReactElement(value)
	}

	// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
	var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
	var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

	function isReactElement(value) {
		return value.$$typeof === REACT_ELEMENT_TYPE
	}

	function emptyTarget(val) {
		return Array.isArray(val) ? [] : {}
	}

	function cloneUnlessOtherwiseSpecified(value, options) {
		return (options.clone !== false && options.isMergeableObject(value))
			? deepmerge(emptyTarget(value), value, options)
			: value
	}

	function defaultArrayMerge(target, source, options) {
		return target.concat(source).map(function(element) {
			return cloneUnlessOtherwiseSpecified(element, options)
		})
	}

	function getMergeFunction(key, options) {
		if (!options.customMerge) {
			return deepmerge
		}
		var customMerge = options.customMerge(key);
		return typeof customMerge === 'function' ? customMerge : deepmerge
	}

	function getEnumerableOwnPropertySymbols(target) {
		return Object.getOwnPropertySymbols
			? Object.getOwnPropertySymbols(target).filter(function(symbol) {
				return Object.propertyIsEnumerable.call(target, symbol)
			})
			: []
	}

	function getKeys(target) {
		return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
	}

	function propertyIsOnObject(object, property) {
		try {
			return property in object
		} catch(_) {
			return false
		}
	}

	// Protects from prototype poisoning and unexpected merging up the prototype chain.
	function propertyIsUnsafe(target, key) {
		return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
			&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
				&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
	}

	function mergeObject(target, source, options) {
		var destination = {};
		if (options.isMergeableObject(target)) {
			getKeys(target).forEach(function(key) {
				destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
			});
		}
		getKeys(source).forEach(function(key) {
			if (propertyIsUnsafe(target, key)) {
				return
			}

			if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
				destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
			} else {
				destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
			}
		});
		return destination
	}

	function deepmerge(target, source, options) {
		options = options || {};
		options.arrayMerge = options.arrayMerge || defaultArrayMerge;
		options.isMergeableObject = options.isMergeableObject || isMergeableObject;
		// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
		// implementations can use it. The caller may not replace it.
		options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

		var sourceIsArray = Array.isArray(source);
		var targetIsArray = Array.isArray(target);
		var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

		if (!sourceAndTargetTypesMatch) {
			return cloneUnlessOtherwiseSpecified(source, options)
		} else if (sourceIsArray) {
			return options.arrayMerge(target, source, options)
		} else {
			return mergeObject(target, source, options)
		}
	}

	deepmerge.all = function deepmergeAll(array, options) {
		if (!Array.isArray(array)) {
			throw new Error('first argument should be an array')
		}

		return array.reduce(function(prev, next) {
			return deepmerge(prev, next, options)
		}, {})
	};

	var deepmerge_1 = deepmerge;

	cjs = deepmerge_1;
	return cjs;
}

requireCjs();

ce({
  base: "w-full text-gray-500 dark:text-gray-400",
  variants: {
    flush: {
      true: "",
      false: "border border-gray-200 dark:border-gray-700 rounded-t-xl"
    }
  }
});
ce({
  slots: {
    base: "group",
    button: "flex items-center justify-between w-full font-medium text-left group-first:rounded-t-xl border-gray-200 dark:border-gray-700 border-b",
    content: "border-b border-gray-200 dark:border-gray-700",
    active: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800",
    inactive: "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
  },
  variants: {
    flush: {
      true: {
        button: "py-5",
        content: "py-5"
      },
      false: {
        button: "p-5 border-s border-e group-first:border-t",
        content: "p-5 border-s border-e"
      }
    },
    open: {
      true: {},
      false: {}
    }
  },
  compoundVariants: [
    {
      flush: true,
      open: true,
      class: {
        button: "text-gray-900 dark:text-white"
      }
    },
    {
      flush: true,
      open: false,
      class: {
        button: "text-gray-500 dark:text-gray-400"
      }
    }
  ],
  defaultVariants: {
    flush: false,
    open: false
  }
});
ce({
  base: "p-4 gap-3 text-sm",
  variants: {
    color: {
      // primary, secondary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
      primary: "bg-primary-50 dark:bg-gray-800 text-primary-800 dark:text-primary-400",
      secondary: "bg-secondary-50 dark:bg-secondary-800 text-secondary-800 dark:text-secondary-400",
      gray: "bg-gray-100 text-gray-500 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300",
      red: "bg-red-100 text-red-500 focus:ring-red-400 dark:bg-red-200 dark:text-red-600",
      orange: "bg-orange-100 text-orange-500 focus:ring-orange-400 dark:bg-orange-200 dark:text-orange-600",
      amber: "bg-amber-100 text-amber-500 focus:ring-amber-400 dark:bg-amber-200 dark:text-amber-600",
      yellow: "bg-yellow-100 text-yellow-500 focus:ring-yellow-400 dark:bg-yellow-200 dark:text-yellow-600",
      lime: "bg-lime-100 text-lime-500 focus:ring-lime-400 dark:bg-lime-200 dark:text-lime-600",
      green: "bg-green-100 text-green-500 focus:ring-green-400 dark:bg-green-200 dark:text-green-600",
      emerald: "bg-emerald-100 text-emerald-500 focus:ring-emerald-400 dark:bg-emerald-200 dark:text-emerald-600",
      teal: "bg-teal-100 text-teal-500 focus:ring-teal-400 dark:bg-teal-200 dark:text-teal-600",
      cyan: "bg-cyan-100 text-cyan-500 focus:ring-cyan-400 dark:bg-cyan-200 dark:text-cyan-600",
      sky: "bg-sky-100 text-sky-500 focus:ring-sky-400 dark:bg-sky-200 dark:text-sky-600",
      blue: "bg-blue-100 text-blue-500 focus:ring-blue-400 dark:bg-blue-200 dark:text-blue-600",
      indigo: "bg-indigo-100 text-indigo-500 focus:ring-indigo-400 dark:bg-indigo-200 dark:text-indigo-600",
      violet: "bg-violet-100 text-violet-500 focus:ring-violet-400 dark:bg-violet-200 dark:text-violet-600",
      purple: "bg-purple-100 text-purple-500 focus:ring-purple-400 dark:bg-purple-200 dark:text-purple-600",
      fuchsia: "bg-fuchsia-100 text-fuchsia-500 focus:ring-fuchsia-400 dark:bg-fuchsia-200 dark:text-fuchsia-600",
      pink: "bg-pink-100 text-pink-500 focus:ring-pink-400 dark:bg-pink-200 dark:text-pink-600",
      rose: "bg-rose-100 text-rose-500 focus:ring-rose-400 dark:bg-rose-200 dark:text-rose-600"
    },
    rounded: {
      true: "rounded-lg"
    },
    border: {
      true: "border"
    },
    icon: {
      true: "flex items-center"
    },
    dismissable: {
      true: "flex items-center"
    }
  },
  compoundVariants: [
    // primary, secondary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
    {
      border: true,
      color: "primary",
      class: "border-primary-500 dark:border-primary-200 divide-primary-500 dark:divide-primary-200"
    },
    {
      border: true,
      color: "secondary",
      class: "border-secondary-500 dark:border-secondary-200 divide-secondary-500 dark:divide-secondary-200"
    },
    {
      border: true,
      color: "gray",
      class: "border-gray-300 dark:border-gray-800 divide-gray-300 dark:divide-gray-800"
    },
    {
      border: true,
      color: "red",
      class: "border-red-300 dark:border-red-800 divide-red-300 dark:divide-red-800"
    },
    {
      border: true,
      color: "orange",
      class: "border-orange-300 dark:border-orange-800 divide-orange-300 dark:divide-orange-800"
    },
    {
      border: true,
      color: "amber",
      class: "border-amber-300 dark:border-amber-800 divide-amber-300 dark:divide-amber-800"
    },
    {
      border: true,
      color: "yellow",
      class: "border-yellow-300 dark:border-yellow-800 divide-yellow-300 dark:divide-yellow-800"
    },
    {
      border: true,
      color: "lime",
      class: "border-lime-300 dark:border-lime-800 divide-lime-300 dark:divide-lime-800"
    },
    {
      border: true,
      color: "green",
      class: "border-green-300 dark:border-green-800 divide-green-300 dark:divide-green-800"
    },
    {
      border: true,
      color: "emerald",
      class: "border-emerald-300 dark:border-emerald-800 divide-emerald-300 dark:divide-emerald-800"
    },
    {
      border: true,
      color: "teal",
      class: "border-teal-300 dark:border-teal-800 divide-teal-300 dark:divide-teal-800"
    },
    {
      border: true,
      color: "cyan",
      class: "border-cyan-300 dark:border-cyan-800 divide-cyan-300 dark:divide-cyan-800"
    },
    {
      border: true,
      color: "sky",
      class: "border-sky-300 dark:border-sky-800 divide-sky-300 dark:divide-sky-800"
    },
    {
      border: true,
      color: "blue",
      class: "border-blue-300 dark:border-blue-800 divide-blue-300 dark:divide-blue-800"
    },
    {
      border: true,
      color: "indigo",
      class: "border-indigo-300 dark:border-indigo-800 divide-indigo-300 dark:divide-indigo-800"
    },
    //  violet, purple, fuchsia, pink, rose
    {
      border: true,
      color: "violet",
      class: "border-violet-300 dark:border-violet-800 divide-violet-300 dark:divide-violet-800"
    },
    {
      border: true,
      color: "purple",
      class: "border-purple-300 dark:border-purple-800 divide-purple-300 dark:divide-purple-800"
    },
    {
      border: true,
      color: "fuchsia",
      class: "border-fuchsia-300 dark:border-fuchsia-800 divide-fuchsia-300 dark:divide-fuchsia-800"
    },
    {
      border: true,
      color: "pink",
      class: "border-pink-300 dark:border-pink-800 divide-pink-300 dark:divide-pink-800"
    },
    {
      border: true,
      color: "rose",
      class: "border-rose-300 dark:border-rose-800 divide-rose-300 dark:divide-rose-800"
    }
  ],
  defaultVariants: {
    color: "primary",
    rounded: true
  }
});
ce({
  base: "relative flex items-center justify-center bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300",
  variants: {
    cornerStyle: {
      rounded: "rounded-sm",
      circular: "rounded-full"
    },
    border: {
      true: "p-1 ring-2 ring-gray-300 dark:ring-gray-500",
      false: ""
    },
    stacked: {
      true: "border-2 -ms-4 border-white dark:border-gray-800",
      false: ""
    },
    size: {
      xs: "w-6 h-6",
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-20 h-20",
      xl: "w-36 h-36"
    }
  },
  defaultVariants: {
    cornerStyle: "circular",
    border: false,
    stacked: false,
    size: "md"
  }
});
ce({
  slots: {
    hrefClass: "flex align-middle",
    base: "font-medium inline-flex items-center justify-center px-2.5 py-0.5"
  },
  variants: {
    color: {
      // primary, secondary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
      primary: { base: "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300" },
      secondary: { base: "bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300" },
      gray: { base: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
      red: { base: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
      orange: { base: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
      amber: { base: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" },
      yellow: { base: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
      lime: { base: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300" },
      green: { base: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
      emerald: { base: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300" },
      teal: { base: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300" },
      cyan: { base: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300" },
      sky: { base: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300" },
      blue: { base: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
      indigo: { base: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300" },
      violet: { base: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300" },
      fuchsia: { base: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300" },
      purple: { base: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
      pink: { base: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300" },
      rose: { base: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300" }
    },
    size: {
      small: "text-xs",
      large: "text-sm"
    },
    border: {
      true: { base: "border" }
    },
    rounded: {
      true: { base: "rounded-full" },
      false: "rounded-sm"
    }
  },
  compoundVariants: [
    {
      border: true,
      color: "primary",
      class: "dark:bg-transparent dark:text-primary-400 border-primary-400 dark:border-primary-400"
    },
    {
      border: true,
      color: "secondary",
      class: "dark:bg-transparent dark:text-secondary-400 border-secondary-400 dark:border-secondary-400"
    },
    {
      border: true,
      color: "gray",
      class: "dark:bg-transparent dark:text-gray-400 border-gray-400 dark:border-gray-400"
    },
    {
      border: true,
      color: "red",
      class: "dark:bg-transparent dark:text-red-400 border-red-400 dark:border-red-400"
    },
    {
      border: true,
      color: "orange",
      class: "dark:bg-transparent dark:text-orange-400 border-orange-400 dark:border-orange-400"
    },
    {
      border: true,
      color: "amber",
      class: "dark:bg-transparent dark:text-amber-400 border-amber-400 dark:border-amber-400"
    },
    {
      border: true,
      color: "yellow",
      class: "dark:bg-transparent dark:text-yellow-300 border-yellow-300 dark:border-yellow-300"
    },
    {
      border: true,
      color: "lime",
      class: "dark:bg-transparent dark:text-lime-400 border-lime-400 dark:border-lime-400"
    },
    {
      border: true,
      color: "green",
      class: "dark:bg-transparent dark:text-green-400 border-green-400 dark:border-green-400"
    },
    {
      border: true,
      color: "emerald",
      class: "dark:bg-transparent dark:text-emerald-400 border-emerald-400 dark:border-emerald-400"
    },
    {
      border: true,
      color: "teal",
      class: "dark:bg-transparent dark:text-teal-400 border-teal-400 dark:border-teal-400"
    },
    {
      border: true,
      color: "cyan",
      class: "dark:bg-transparent dark:text-cyan-400 border-cyan-400 dark:border-cyan-400"
    },
    {
      border: true,
      color: "sky",
      class: "dark:bg-transparent dark:text-sky-400 border-sky-400 dark:border-sky-400"
    },
    {
      border: true,
      color: "blue",
      class: "dark:bg-transparent dark:text-blue-400 border-blue-400 dark:border-blue-400"
    },
    {
      border: true,
      color: "indigo",
      class: "dark:bg-transparent dark:text-indigo-400 border-indigo-400 dark:border-indigo-400"
    },
    {
      border: true,
      color: "violet",
      class: "dark:bg-transparent dark:text-violet-400 border-violet-400 dark:border-violet-400"
    },
    {
      border: true,
      color: "purple",
      class: "dark:bg-transparent dark:text-purple-400 border-purple-400 dark:border-purple-400"
    },
    {
      border: true,
      color: "fuchsia",
      class: "dark:bg-transparent dark:text-fuchsia-400 border-fuchsia-400 dark:border-fuchsia-400"
    },
    {
      border: true,
      color: "pink",
      class: "dark:bg-transparent dark:text-pink-400 border-pink-400 dark:border-pink-400"
    },
    {
      border: true,
      color: "rose",
      class: "dark:bg-transparent dark:text-rose-400 border-rose-400 dark:border-rose-400"
    },
    {
      href: true,
      color: "primary",
      class: "hover:bg-primary-200"
    },
    {
      href: true,
      color: "secondary",
      class: "hover:bg-secondary-200"
    },
    {
      href: true,
      color: "gray",
      class: "hover:bg-gray-200"
    },
    {
      href: true,
      color: "red",
      class: "hover:bg-red-200"
    },
    {
      href: true,
      color: "orange",
      class: "hover:bg-orange-200"
    },
    {
      href: true,
      color: "amber",
      class: "hover:bg-amber-200"
    },
    {
      href: true,
      color: "yellow",
      class: "hover:bg-yellow-200"
    },
    {
      href: true,
      color: "lime",
      class: "hover:bg-lime-200"
    },
    {
      href: true,
      color: "green",
      class: "hover:bg-green-200"
    },
    {
      href: true,
      color: "emerald",
      class: "hover:bg-emerald-200"
    },
    {
      href: true,
      color: "teal",
      class: "hover:bg-teal-200"
    },
    {
      href: true,
      color: "cyan",
      class: "hover:bg-cyan-200"
    },
    {
      href: true,
      color: "sky",
      class: "hover:bg-sky-200"
    },
    {
      href: true,
      color: "blue",
      class: "hover:bg-blue-200"
    },
    {
      href: true,
      color: "indigo",
      class: "hover:bg-indigo-200"
    },
    {
      href: true,
      color: "violet",
      class: "hover:bg-violet-200"
    },
    {
      href: true,
      color: "purple",
      class: "hover:bg-purple-200"
    },
    {
      href: true,
      color: "fuchsia",
      class: "hover:bg-fuchsia-200"
    },
    {
      href: true,
      color: "pink",
      class: "hover:bg-pink-200"
    },
    {
      href: true,
      color: "rose",
      class: "hover:bg-rose-200"
    }
  ],
  defaultVariants: {
    color: "primary",
    size: "small",
    rounded: false
  }
});
ce({
  slots: {
    base: "fixed z-50 flex justify-between p-4 mx-auto dark:bg-gray-700 dark:border-gray-600",
    insideDiv: "flex flex-col md:flex-row md:items-center gap-2 mx-auto",
    dismissable: "absolute end-2.5 top-2.5 md:static md:end-auto md:top-auto"
  },
  variants: {
    type: {
      top: {
        base: "top-0 start-0 w-full border-b border-gray-200 bg-gray-50"
      },
      bottom: {
        base: "bottom-0 start-0 w-full border-t border-gray-200 bg-gray-50"
      }
    },
    color: {
      // 'primary' secondary, | 'gray' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose'
      primary: { base: "bg-primary-50 dark:bg-primary-900" },
      secondary: { base: "bg-secondary-50 dark:bg-secondary-900" },
      gray: { base: "bg-gray-50 dark:bg-gray-700" },
      red: { base: "bg-red-50 dark:bg-red-900" },
      orange: { base: "bg-orange-50 dark:bg-orange-900" },
      amber: { base: "bg-amber-50 dark:bg-amber-900" },
      yellow: { base: "bg-yellow-50 dark:bg-yellow-900" },
      lime: { base: "bg-lime-50 dark:bg-lime-900" },
      green: { base: "bg-green-50 dark:bg-green-900" },
      emerald: { base: "bg-emerald-50 dark:bg-emerald-900" },
      teal: { base: "bg-teal-50 dark:bg-teal-900" },
      cyan: { base: "bg-cyan-50 dark:bg-cyan-900" },
      sky: { base: "bg-sky-50 dark:bg-sky-900" },
      blue: { base: "bg-blue-50 dark:bg-blue-900" },
      indigo: { base: "bg-indigo-50 dark:bg-indigo-900" },
      violet: { base: "bg-violet-50 dark:bg-violet-900" },
      purple: { base: "bg-purple-50 dark:bg-purple-900" },
      fuchsia: { base: "bg-fuchsia-50 dark:bg-fuchsia-900" },
      pink: { base: "bg-pink-50 dark:bg-pink-900" },
      rose: { base: "bg-rose-50 dark:bg-rose-900" }
    }
  },
  defaultVariants: {
    type: "top",
    multiline: true
  }
});
ce({
  slots: {
    outer: "w-full z-30 border-gray-200 dark:bg-gray-700 dark:border-gray-600",
    inner: "grid h-full max-w-lg mx-auto"
  },
  variants: {
    position: {
      static: { outer: "static" },
      fixed: { outer: "fixed" },
      absolute: { outer: "absolute" },
      relative: { outer: "relative" },
      sticky: { outer: "sticky" }
    },
    navType: {
      default: { outer: "bottom-0 start-0 h-16 bg-white border-t" },
      border: { outer: "bottom-0 start-0 h-16 bg-white border-t" },
      application: {
        outer: "h-16 max-w-lg -translate-x-1/2 rtl:translate-x-1/2 bg-white border rounded-full bottom-4 start-1/2"
      },
      pagination: {
        outer: "bottom-0 h-16 -translate-x-1/2 rtl:translate-x-1/2 bg-white border-t start-1/2"
      },
      group: {
        outer: "bottom-0 -translate-x-1/2 rtl:translate-x-1/2 bg-white border-t start-1/2"
      },
      card: { outer: "bottom-0 start-0 h-16 bg-white border-t" },
      meeting: {
        outer: "bottom-0 start-0 grid h-16 grid-cols-1 px-8 bg-white border-t md:grid-cols-3",
        inner: "flex items-center justify-center mx-auto"
      },
      video: {
        outer: "bottom-0 start-0 grid h-24 grid-cols-1 px-8 bg-white border-t md:grid-cols-3",
        inner: "flex items-center w-full"
      }
    }
  },
  defaultVariants: {
    position: "fixed",
    navType: "default"
  }
});
ce({
  slots: {
    base: "inline-flex flex-col items-center justify-center",
    span: "text-sm"
  },
  variants: {
    navType: {
      default: {
        base: "px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group",
        span: "text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500"
      },
      border: {
        base: "px-5 border-gray-200 border-x hover:bg-gray-50 dark:hover:bg-gray-800 group dark:border-gray-600",
        span: "text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500"
      },
      application: {
        base: "",
        span: "sr-only"
      },
      pagination: {
        base: "px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group",
        span: "sr-only"
      },
      group: {
        base: "p-4 hover:bg-gray-50 dark:hover:bg-gray-800 group",
        span: "sr-only"
      },
      card: {
        base: "px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group",
        span: "text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500"
      },
      meeting: {
        base: "",
        span: ""
      },
      video: {
        base: "",
        span: ""
      }
    },
    appBtnPosition: {
      left: {
        base: "px-5 rounded-s-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
      },
      middle: { base: "px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group" },
      right: {
        base: "px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
      }
    }
  },
  defaultVariants: {
    navType: "default",
    appBtnPosition: "middle",
    active: false
  }
});
ce({
  slots: {
    innerDiv: "grid max-w-xs grid-cols-3 gap-1 p-1 mx-auto my-2 bg-gray-100 rounded-lg dark:bg-gray-600",
    outerDiv: "w-full"
  }
});
ce({
  base: "px-5 py-1.5 text-xs font-medium rounded-lg",
  variants: {
    active: {
      true: "text-white bg-gray-900 dark:bg-gray-300 dark:text-gray-900",
      false: "text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700"
    }
  }
});
ce({
  slots: {
    nav: "flex",
    list: "inline-flex items-center space-x-1 rtl:space-x-reverse md:space-x-3 rtl:space-x-reverse",
    item: "inline-flex items-center",
    icon: "h-6 w-6 text-gray-400 rtl:-scale-x-100"
  },
  variants: {
    solid: {
      true: {
        nav: "px-5 py-3 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
      },
      false: ""
    },
    home: {
      true: "",
      false: ""
    },
    hasHref: {
      true: "",
      false: ""
    }
  },
  compoundVariants: [
    {
      home: true,
      class: {
        item: "inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
        icon: "me-2 h-4 w-4"
      }
    },
    {
      home: false,
      hasHref: true,
      class: {
        item: "ms-1 text-sm font-medium text-gray-700 hover:text-gray-900 md:ms-2 dark:text-gray-400 dark:hover:text-white"
      }
    },
    {
      home: false,
      hasHref: false,
      class: {
        item: "ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400"
      }
    }
  ],
  defaultVariants: {
    solid: false
  }
});
ce({
  base: "inline-flex rounded-lg shadow-xs",
  variants: {
    size: {
      sm: "scale-90",
      md: "scale-100",
      lg: "scale-110"
    }
  },
  defaultVariants: {
    size: "md"
  }
});
ce({
  slots: {
    base: "text-center font-medium inline-flex items-center justify-center",
    outline: "bg-transparent border hover:text-white dark:bg-transparent dark:hover-text-white",
    shadow: "shadow-lg"
  },
  variants: {
    color: {
      // "primary" | "dark" | "alternative" | "light" | "secondary" | "gray" | "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose"
      primary: {
        base: "text-white bg-primary-700 hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-700 focus-within:ring-primary-300 dark:focus-within:ring-primary-800",
        outline: "text-primary-700 border-primary-700 hover:bg-primary-800 dark:border-primary-500 dark:text-primary-500 dark:hover:bg-primary-600",
        shadow: "shadow-primary-500/50 dark:shadow-primary-800/80"
      },
      dark: {
        base: "text-white bg-gray-800 hover:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 focus-within:ring-gray-300 dark:focus-within:ring-gray-700",
        outline: "text-gray-900 border-gray-800 hover:bg-gray-900 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600",
        shadow: "shadow-gray-500/50 gray:shadow-gray-800/80"
      },
      alternative: {
        base: "text-gray-900 bg-transparent border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 hover:text-primary-700 focus-within:text-primary-700 dark:focus-within:text-white dark:hover:text-white dark:hover:bg-gray-700 focus-within:ring-gray-200 dark:focus-within:ring-gray-700",
        outline: "text-gray-700 border-gray-700 hover:bg-gray-800 dark:border-gray-400 dark:text-gray-400 dark:hover:bg-gray-500",
        shadow: "_shadow-gray-500/50 dark:shadow-gray-800/80"
      },
      light: {
        base: "text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 focus-within:ring-gray-200 dark:focus-within:ring-gray-700",
        outline: "text-gray-700 border-gray-700 hover:bg-gray-800 dark:border-gray-400 dark:text-gray-400 dark:hover:bg-gray-500",
        shadow: "shadow-gray-500/50 dark:shadow-gray-800/80"
      },
      secondary: {
        base: "text-white bg-secondary-700 hover:bg-secondary-800 dark:bg-secondary-600 dark:hover:bg-secondary-700 focus-within:ring-secondary-300 dark:focus-within:ring-secondary-800",
        outline: "text-secondary-700 border-secondary-700 hover:bg-secondary-800 dark:border-secondary-400 dark:text-secondary-400 dark:hover:bg-secondary-500",
        shadow: "shadow-secondary-500/50 dark:shadow-secondary-800/80"
      },
      gray: {
        base: "text-white bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 focus-within:ring-gray-300 dark:focus-within:ring-gray-800",
        outline: "text-gray-700 border-gray-700 hover:bg-gray-800 dark:border-gray-400 dark:text-gray-400 dark:hover:bg-gray-500",
        shadow: "shadow-gray-500/50 dark:shadow-gray-800/80"
      },
      red: {
        base: "text-white bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 focus-within:ring-red-300 dark:focus-within:ring-red-900",
        outline: "text-red-700 border-red-700 hover:bg-red-800 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600",
        shadow: "shadow-red-500/50 dark:shadow-red-800/80"
      },
      orange: {
        base: "text-white bg-orange-700 hover:bg-orange-800 dark:bg-orange-600 dark:hover:bg-orange-700 focus-within:ring-orange-300 dark:focus-within:ring-orange-900",
        outline: "text-orange-700 border-orange-700 hover:bg-orange-800 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-500",
        shadow: "shadow-orange-500/50 dark:shadow-orange-800/80"
      },
      amber: {
        base: "text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 focus-within:ring-amber-300 dark:focus-within:ring-amber-900",
        outline: "text-amber-700 border-amber-700 hover:bg-amber-800 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-500",
        shadow: "shadow-amber-500/50 dark:shadow-amber-800/80"
      },
      yellow: {
        base: "text-white bg-yellow-400 hover:bg-yellow-500 focus-within:ring-yellow-300 dark:focus-within:ring-yellow-900",
        outline: "text-yellow-400 border-yellow-400 hover:bg-yellow-500 dark:border-yellow-300 dark:text-yellow-300 dark:hover:bg-yellow-400",
        shadow: "shadow-yellow-500/50 dark:shadow-yellow-800/80"
      },
      lime: {
        base: "text-white bg-lime-700 hover:bg-lime-800 dark:bg-lime-600 dark:hover:bg-lime-700 focus-within:ring-lime-300 dark:focus-within:ring-lime-800",
        outline: "text-lime-700 border-lime-700 hover:bg-lime-800 dark:border-lime-400 dark:text-lime-400 dark:hover:bg-lime-500",
        shadow: "shadow-lime-500/50 dark:shadow-lime-800/80"
      },
      green: {
        base: "text-white bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 focus-within:ring-green-300 dark:focus-within:ring-green-800",
        outline: "text-green-700 border-green-700 hover:bg-green-800 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600",
        shadow: "shadow-green-500/50 dark:shadow-green-800/80"
      },
      emerald: {
        base: "text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 focus-within:ring-emerald-300 dark:focus-within:ring-emerald-800",
        outline: "text-emerald-700 border-emerald-700 hover:bg-emerald-800 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-500",
        shadow: "shadow-emerald-500/50 dark:shadow-emerald-800/80"
      },
      teal: {
        base: "text-white bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700 focus-within:ring-teal-300 dark:focus-within:ring-teal-800",
        outline: "text-teal-700 border-teal-700 hover:bg-teal-800 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-500",
        shadow: "shadow-teal-500/50 dark:shadow-teal-800/80"
      },
      cyan: {
        base: "text-white bg-cyan-700 hover:bg-cyan-800 dark:bg-cyan-600 dark:hover:bg-cyan-700 focus-within:ring-cyan-300 dark:focus-within:ring-cyan-800",
        outline: "text-cyan-700 border-cyan-700 hover:bg-cyan-800 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-500",
        shadow: "shadow-cyan-500/50 dark:shadow-cyan-800/80"
      },
      sky: {
        base: "text-white bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-700 focus-within:ring-sky-300 dark:focus-within:ring-sky-800",
        outline: "text-sky-700 border-sky-700 hover:bg-sky-800 dark:border-sky-400 dark:text-sky-400 dark:hover:bg-sky-500",
        shadow: "shadow-sky-500/50 dark:shadow-sky-800/80"
      },
      blue: {
        base: "text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus-within:ring-blue-300 dark:focus-within:ring-blue-800",
        outline: "text-blue-700 border-blue-700 hover:bg-blue-800 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500",
        shadow: "shadow-blue-500/50 dark:shadow-blue-800/80"
      },
      indigo: {
        base: "text-white bg-indigo-700 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus-within:ring-indigo-300 dark:focus-within:ring-indigo-800",
        outline: "text-indigo-700 border-indigo-700 hover:bg-indigo-800 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-500",
        shadow: "shadow-indigo-500/50 dark:shadow-indigo-800/80"
      },
      violet: {
        base: "text-white bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 focus-within:ring-violet-300 dark:focus-within:ring-violet-800",
        outline: "text-violet-700 border-violet-700 hover:bg-violet-800 dark:border-violet-400 dark:text-violet-400 dark:hover:bg-violet-500",
        shadow: "shadow-violet-500/50 dark:shadow-violet-800/80"
      },
      purple: {
        base: "text-white bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700",
        outline: "text-purple-700 border-purple-700 hover:bg-purple-800 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-500",
        shadow: "shadow-purple-500/50 dark:shadow-purple-800/80"
      },
      fuchsia: {
        base: "text-white bg-fuchsia-700 hover:bg-fuchsia-800 dark:bg-fuchsia-600 dark:hover:bg-fuchsia-700",
        outline: "text-fuchsia-700 border-fuchsia-700 hover:bg-fuchsia-800 dark:border-fuchsia-400 dark:text-fuchsia-400 dark:hover:bg-fuchsia-500",
        shadow: "shadow-fuchsia-500/50 dark:shadow-fuchsia-800/80"
      },
      pink: {
        base: "text-white bg-pink-700 hover:bg-pink-800 dark:bg-pink-600 dark:hover:bg-pink-700",
        outline: "text-pink-700 border-pink-700 hover:bg-pink-800 dark:border-pink-400 dark:text-pink-400 dark:hover:bg-pink-500",
        shadow: "shadow-pink-500/50 dark:shadow-pink-800/80"
      },
      rose: {
        base: "text-white bg-rose-700 hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-700",
        outline: "text-rose-700 border-rose-700 hover:bg-rose-800 dark:border-rose-400 dark:text-rose-400 dark:hover:bg-rose-500",
        shadow: "shadow-rose-500/50 dark:shadow-rose-800/80"
      }
    },
    size: {
      xs: "px-3 py-2 text-xs",
      sm: "px-4 py-2 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-5 py-3 text-base",
      xl: "px-6 py-3.5 text-base"
    },
    group: {
      true: "focus-within:ring-2 focus-within:z-10 [&:not(:first-child)]:rounded-s-none [&:not(:last-child)]:rounded-e-none [&:not(:last-child)]:border-e-0",
      false: "focus-within:ring-4 focus-within:outline-hidden"
    },
    disabled: {
      true: "cursor-not-allowed opacity-50",
      false: ""
    },
    pill: {
      true: "rounded-full",
      false: "rounded-lg"
    },
    checked: {
      true: "",
      false: ""
    }
  },
  compoundVariants: [],
  defaultVariants: {
    pill: false
  }
});
ce({
  slots: {
    base: "inline-flex items-center justify-center transition-all duration-75 ease-in text-white bg-linear-to-r ",
    outlineWrapper: "inline-flex items-center justify-center w-full border-0!"
  },
  variants: {
    color: {
      blue: { base: "from-blue-500 via-blue-600 to-blue-700 hover:bg-linear-to-br focus:ring-blue-300 dark:focus:ring-blue-800" },
      green: { base: "from-green-400 via-green-500 to-green-600 hover:bg-linear-to-br focus:ring-green-300 dark:focus:ring-green-800" },
      cyan: { base: "text-white bg-linear-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-linear-to-br focus:ring-cyan-300 dark:focus:ring-cyan-800" },
      teal: { base: "text-white bg-linear-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-linear-to-br focus:ring-teal-300 dark:focus:ring-teal-800" },
      lime: { base: "text-gray-900 bg-linear-to-r from-lime-200 via-lime-400 to-lime-500 hover:bg-linear-to-br focus:ring-lime-300 dark:focus:ring-lime-800" },
      red: { base: "text-white bg-linear-to-r from-red-400 via-red-500 to-red-600 hover:bg-linear-to-br focus:ring-red-300 dark:focus:ring-red-800" },
      pink: { base: "text-white bg-linear-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-linear-to-br focus:ring-pink-300 dark:focus:ring-pink-800" },
      purple: { base: "text-white bg-linear-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-linear-to-br focus:ring-purple-300 dark:focus:ring-purple-800" },
      purpleToBlue: { base: "text-white bg-linear-to-br from-purple-600 to-blue-500 hover:bg-linear-to-bl focus:ring-blue-300 dark:focus:ring-blue-800" },
      cyanToBlue: { base: "text-white bg-linear-to-r from-cyan-500 to-blue-500 hover:bg-linear-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800" },
      greenToBlue: { base: "text-white bg-linear-to-br from-green-400 to-blue-600 hover:bg-linear-to-bl focus:ring-green-200 dark:focus:ring-green-800" },
      purpleToPink: { base: "text-white bg-linear-to-r from-purple-500 to-pink-500 hover:bg-linear-to-l focus:ring-purple-200 dark:focus:ring-purple-800" },
      pinkToOrange: { base: "text-white bg-linear-to-br from-pink-500 to-orange-400 hover:bg-linear-to-bl focus:ring-pink-200 dark:focus:ring-pink-800" },
      tealToLime: { base: "text-gray-900 bg-linear-to-r from-teal-200 to-lime-200 hover:bg-linear-to-l focus:ring-lime-200 dark:focus:ring-teal-700" },
      redToYellow: { base: "text-gray-900 bg-linear-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-linear-to-bl focus:ring-red-100 dark:focus:ring-red-400" }
    },
    outline: {
      true: {
        base: "p-0.5",
        outlineWrapper: "bg-white text-gray-900! dark:bg-gray-900 dark:text-white! hover:bg-transparent hover:text-inherit! group-hover:opacity-0! group-hover:text-inherit!"
      }
    },
    pill: {
      true: {
        base: "rounded-full",
        outlineWrapper: "rounded-full"
      },
      false: {
        base: "rounded-lg",
        outlineWrapper: "rounded-lg"
      }
    },
    size: {
      xs: "px-3 py-2 text-xs",
      sm: "px-4 py-2 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-5 py-3 text-base",
      xl: "px-6 py-3.5 text-base"
    },
    shadow: {
      true: {
        base: "shadow-lg"
      }
    },
    group: {
      true: "rounded-none",
      false: ""
    },
    disabled: {
      true: { base: "opacity-50 cursor-not-allowed" }
    }
  },
  compoundVariants: [
    {
      shadow: true,
      color: "blue",
      class: { base: "shadow-blue-500/50 dark:shadow-blue-800/80" }
    },
    {
      shadow: true,
      color: "green",
      class: { base: "shadow-green-500/50 dark:shadow-green-800/80" }
    },
    {
      shadow: true,
      color: "cyan",
      class: { base: "shadow-cyan-500/50 dark:shadow-cyan-800/80" }
    },
    {
      shadow: true,
      color: "teal",
      class: { base: "shadow-teal-500/50 dark:shadow-teal-800/80" }
    },
    {
      shadow: true,
      color: "lime",
      class: { base: "shadow-lime-500/50 dark:shadow-lime-800/80" }
    },
    {
      shadow: true,
      color: "red",
      class: { base: "shadow-red-500/50 dark:shadow-red-800/80" }
    },
    {
      shadow: true,
      color: "pink",
      class: { base: "shadow-pink-500/50 dark:shadow-pink-800/80" }
    },
    {
      shadow: true,
      color: "purple",
      class: { base: "shadow-purple-500/50 dark:shadow-purple-800/80" }
    },
    {
      shadow: true,
      color: "purpleToBlue",
      class: { base: "shadow-blue-500/50 dark:shadow-blue-800/80" }
    },
    {
      shadow: true,
      color: "cyanToBlue",
      class: { base: "shadow-cyan-500/50 dark:shadow-cyan-800/80" }
    },
    {
      shadow: true,
      color: "greenToBlue",
      class: { base: "shadow-green-500/50 dark:shadow-green-800/80" }
    },
    {
      shadow: true,
      color: "purpleToPink",
      class: { base: "shadow-purple-500/50 dark:shadow-purple-800/80" }
    },
    {
      shadow: true,
      color: "pinkToOrange",
      class: { base: "shadow-pink-500/50 dark:shadow-pink-800/80" }
    },
    {
      shadow: true,
      color: "tealToLime",
      class: { base: "shadow-lime-500/50 dark:shadow-teal-800/80" }
    },
    {
      shadow: true,
      color: "redToYellow",
      class: { base: "shadow-red-500/50 dark:shadow-red-800/80" }
    },
    {
      group: true,
      pill: true,
      class: "first:rounded-s-full last:rounded-e-full"
    },
    {
      group: true,
      pill: false,
      class: "first:rounded-s-lg last:rounded-e-lg"
    }
  ]
});
ce({
  slots: {
    base: "w-full flex max-w-sm bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700",
    image: "rounded-t-lg"
  },
  variants: {
    size: {
      xs: { base: "max-w-xs" },
      sm: { base: "max-w-sm" },
      md: { base: "max-w-lg" },
      lg: { base: "max-w-2xl" },
      xl: { base: "max-w-none" }
    },
    color: {
      // primary, secondary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
      gray: { base: "border-gray-200 dark:bg-gray-800 dark:border-gray-700" },
      primary: { base: "border-primary-200 bg-primary-400 dark:bg-primary-800 dark:border-primary-700" },
      secondary: { base: "border-secondary-200 bg-secondary-400 dark:bg-secondary-800 dark:border-secondary-700" },
      red: { base: "border-red-200 bg-red-400 dark:bg-red-800 dark:border-red-700" },
      orange: { base: "border-orange-200 bg-orange-400 dark:bg-orange-800 dark:border-orange-700" },
      amber: { base: "border-amber-200 bg-amber-400 dark:bg-amber-800 dark:border-amber-700" },
      yellow: { base: "border-yellow-200 bg-yellow-400 dark:bg-yellow-800 dark:border-yellow-700" },
      lime: { base: "border-lime-200 bg-lime-400 dark:bg-lime-800 dark:border-lime-700" },
      green: { base: "border-green-200 bg-green-400 dark:bg-green-800 dark:border-green-700" },
      emerald: { base: "border-emerald-200 bg-emerald-400 dark:bg-emerald-800 dark:border-emerald-700" },
      teal: { base: "border-teal-200 bg-teal-400 dark:bg-teal-800 dark:border-teal-700" },
      cyan: { base: "border-cyan-200 bg-cyan-400 dark:bg-cyan-800 dark:border-cyan-700" },
      sky: { base: "border-sky-200 bg-sky-400 dark:bg-sky-800 dark:border-sky-700" },
      blue: { base: "border-blue-200 bg-blue-400 dark:bg-blue-800 dark:border-blue-700" },
      indigo: { base: "border-indigo-200 bg-indigo-400 dark:bg-indigo-800 dark:border-indigo-700" },
      violet: { base: "border-violet-200 bg-violet-400 dark:bg-violet-800 dark:border-violet-700" },
      purple: { base: "border-purple-200 bg-purple-400 dark:bg-purple-800 dark:border-purple-700" },
      fuchsia: { base: "border-fuchsia-200 bg-fuchsia-400 dark:bg-fuchsia-800 dark:border-fuchsia-700" },
      pink: { base: "border-pink-200 bg-pink-400 dark:bg-pink-800 dark:border-pink-700" },
      rose: { base: "border-rose-200 bg-rose-400 dark:bg-rose-800 dark:border-rose-700" }
    },
    shadow: {
      sm: { base: "shadow-md" },
      normal: { base: "shadow-sm" },
      md: { base: "shadow-md" },
      lg: { base: "shadow-lg" },
      xl: { base: "shadow-xl" },
      "2xl": { base: "shadow-2xl" },
      inner: { base: "shadow-inner" }
    },
    horizontal: {
      true: {
        base: "md:flex-row",
        image: "object-cover w-full h-96 md:h-auto md:w-48 md:rounded-none"
      }
    },
    reverse: {
      true: { base: "flex-col-reverse", image: "rounded-b-lg rounded-tl-none" },
      false: { base: "flex-col", image: "rounded-t-lg" }
    },
    href: {
      true: "",
      false: ""
    },
    hasImage: {
      true: "",
      false: ""
    }
  },
  compoundVariants: [
    {
      horizontal: true,
      reverse: true,
      class: { base: "md:flex-row-reverse", image: "md:rounded-e-lg" }
    },
    {
      horizontal: true,
      reverse: false,
      class: { base: "md:flex-row", image: "md:rounded-s-lg" }
    },
    // gray, primary, secondary, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
    {
      href: true,
      color: "gray",
      class: { base: "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" }
    },
    {
      href: true,
      color: "primary",
      class: { base: "cursor-pointer hover:bg-primary-500 dark:hover:bg-primary-700" }
    },
    {
      href: true,
      color: "secondary",
      class: { base: "cursor-pointer hover:bg-secondary-500 dark:hover:bg-secondary-700" }
    },
    {
      href: true,
      color: "red",
      class: { base: "cursor-pointer hover:bg-red-500 dark:hover:bg-red-700" }
    },
    {
      href: true,
      color: "orange",
      class: { base: "cursor-pointer hover:bg-orange-500 dark:hover:bg-orange-700" }
    },
    {
      href: true,
      color: "amber",
      class: { base: "cursor-pointer hover:bg-amber-500 dark:hover:bg-amber-700" }
    },
    {
      href: true,
      color: "yellow",
      class: { base: "cursor-pointer hover:bg-yellow-500 dark:hover:bg-yellow-700" }
    },
    {
      href: true,
      color: "lime",
      class: { base: "cursor-pointer hover:bg-lime-500 dark:hover:bg-lime-700" }
    },
    {
      href: true,
      color: "green",
      class: { base: "cursor-pointer hover:bg-green-500 dark:hover:bg-green-700" }
    },
    {
      href: true,
      color: "emerald",
      class: { base: "cursor-pointer hover:bg-emerald-500 dark:hover:bg-emerald-700" }
    },
    {
      href: true,
      color: "teal",
      class: { base: "cursor-pointer hover:bg-teal-500 dark:hover:bg-teal-700" }
    },
    {
      href: true,
      color: "cyan",
      class: { base: "cursor-pointer hover:bg-cyan-500 dark:hover:bg-cyan-700" }
    },
    {
      href: true,
      color: "sky",
      class: { base: "cursor-pointer hover:bg-sky-500 dark:hover:bg-sky-700" }
    },
    {
      href: true,
      color: "blue",
      class: { base: "cursor-pointer hover:bg-blue-500 dark:hover:bg-blue-700" }
    },
    {
      href: true,
      color: "indigo",
      class: { base: "cursor-pointer hover:bg-indigo-500 dark:hover:bg-indigo-700" }
    },
    {
      href: true,
      color: "violet",
      class: { base: "cursor-pointer hover:bg-violet-500 dark:hover:bg-violet-700" }
    },
    {
      href: true,
      color: "purple",
      class: { base: "cursor-pointer hover:bg-purple-500 dark:hover:bg-purple-700" }
    },
    {
      href: true,
      color: "fuchsia",
      class: { base: "cursor-pointer hover:bg-fuchsia-500 dark:hover:bg-fuchsia-700" }
    },
    {
      href: true,
      color: "pink",
      class: { base: "cursor-pointer hover:bg-pink-500 dark:hover:bg-pink-700" }
    },
    {
      href: true,
      color: "rose",
      class: { base: "cursor-pointer hover:bg-rose-500 dark:hover:bg-rose-700" }
    }
  ],
  defaultVariants: {
    size: "sm",
    shadow: "normal",
    horizontal: false,
    reverse: false
  }
});
ce({
  slots: {
    base: "relative",
    select: "block w-full rtl:text-right",
    clearbtn: "absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
  },
  variants: {
    underline: {
      true: {
        select: "text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-hidden focus:ring-0 focus:border-gray-200 peer px-0!"
      },
      false: {
        select: "text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
      }
    },
    size: {
      sm: { select: "text-xs px-2.5 py-2.5" },
      md: { select: "text-sm px-2.5 py-2.5" },
      lg: { select: "text-base py-3 px-4" }
    },
    disabled: {
      true: {
        select: "cursor-not-allowed opacity-50"
      },
      false: {}
    }
  },
  defaultVariants: {
    underline: false,
    size: "md"
  }
});
ce({
  slots: {
    base: "relative border border-gray-300 flex items-center rounded-lg gap-2 dark:border-gray-600 ring-primary-500 dark:ring-primary-500 focus-visible:outline-hidden",
    select: "flex flex-wrap gap-2",
    dropdown: "absolute z-50 p-3 flex flex-col gap-1 max-h-64 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 start-0 top-[calc(100%+1rem)] rounded-lg cursor-pointer overflow-y-scroll w-full",
    dropdownitem: "py-2 px-3 rounded-lg text-gray-600 hover:text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-600",
    closebutton: "p-0 focus:ring-gray-400 dark:text-white"
  },
  variants: {
    size: {
      sm: "px-2.5 py-2.5 min-h-[2.4rem] text-xs",
      md: "px-2.5 py-2.5 min-h-[2.7rem] text-sm",
      lg: "px-3 py-3 min-h-[3.2rem] sm:text-base"
    },
    disabled: {
      true: {
        base: "cursor-not-allowed opacity-50 pointer-events-none",
        dropdownitem: "cursor-not-allowed opacity-50",
        closebutton: "cursor-not-allowed"
      },
      false: { base: "focus-within:border-primary-500 dark:focus-within:border-primary-500 focus-within:ring-1" }
    },
    active: {
      true: {
        dropdownitem: "bg-primary-100 text-primary-500 dark:bg-primary-500 dark:text-primary-100 hover:bg-primary-100 dark:hover:bg-primary-500 hover:text-primary-600 dark:hover:text-primary-100"
      }
    },
    selected: {
      true: {
        dropdownitem: "bg-gray-100 text-black font-semibold hover:text-black dark:text-white dark:bg-gray-600 dark:hover:text-white"
      }
    }
  },
  defaultVariants: {
    underline: false,
    size: "md"
  }
});
ce({
  base: "grid overflow-hidden relative rounded-lg h-56 sm:h-64 xl:h-80 2xl:h-96",
  variants: {},
  compoundVariants: [],
  defaultVariants: {}
});
ce({
  slots: {
    base: "absolute start-1/2 z-30 flex -translate-x-1/2 space-x-3 rtl:translate-x-1/2 rtl:space-x-reverse",
    indicator: "bg-gray-100 hover:bg-gray-300"
  },
  variants: {
    selected: {
      true: { indicator: "opacity-100" },
      false: { indicator: "opacity-60" }
    },
    position: {
      top: { base: "top-5" },
      bottom: { base: "bottom-5" },
      withThumbnails: { base: "bottom-24" }
    }
  }
});
ce({
  base: "flex absolute top-0 z-30 justify-center items-center px-4 h-full group focus:outline-hidden text-white dark:text-gray-300",
  variants: {
    forward: {
      true: "end-0",
      false: "start-0"
    }
  }
});
ce({
  base: "flex flex-row justify-center bg-gray-100 w-full"
});
ce({
  base: "",
  variants: {
    selected: {
      true: "opacity-100",
      false: "opacity-60"
    }
  },
  defaultVariants: {
    selected: false
  }
});
ce({
  base: "absolute block w-full! h-full object-cover"
});
ce({
  base: "gap-2",
  variants: {
    embedded: {
      true: "px-1 py-1 focus-within:ring-0 bg-transparent hover:bg-transparent text-inherit",
      false: ""
    }
  },
  defaultVariants: {
    embedded: false
  }
});
ce({
  base: "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-hidden rounded-lg text-sm p-2.5"
});
ce({
  slots: {
    base: "inline-block rounded-lg bg-white dark:bg-gray-700 shadow-lg p-4",
    input: "w-full rounded-md border px-4 py-2 text-sm focus:ring-2 focus:outline-none outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white",
    titleVariant: "mb-2 text-lg font-semibold text-gray-900 dark:text-white",
    polite: "text-sm rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 font-semibold py-2.5 px-5 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200",
    button: "absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 focus:outline-hidden dark:text-gray-400",
    actionButtons: "mt-4 flex justify-between",
    columnHeader: "text-center text-sm font-medium text-gray-500 dark:text-gray-400",
    grid: "grid grid-cols-7 gap-1 w-64",
    nav: "mb-4 flex items-center justify-between",
    dayButton: "h-8 w-full block flex-1 leading-9 border-0 rounded-lg cursor-pointer text-center font-semibold text-sm day p-0",
    monthButton: "rounded-lg px-3 py-2 text-sm hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-700"
  },
  variants: {
    color: {
      primary: { input: "focus:ring-primary-500 dark:focus:ring-primary-400", dayButton: "bg-primary-100 dark:bg-primary-900" },
      blue: { input: "focus:ring-blue-500 dark:focus:ring-blue-400", dayButton: "bg-blue-100 dark:bg-blue-900" },
      red: { input: "focus:ring-red-500 dark:focus:ring-red-400", dayButton: "bg-red-100 dark:bg-red-900" },
      green: { input: "focus:ring-green-500 dark:focus:ring-green-400", dayButton: "bg-green-100 dark:bg-green-900" },
      yellow: { input: "focus:ring-yellow-500 dark:focus:ring-yellow-400", dayButton: "bg-yellow-100 dark:bg-yellow-900" },
      purple: { input: "focus:ring-purple-500 dark:focus:ring-purple-400", dayButton: "bg-purple-100 dark:bg-purple-900" },
      dark: { input: "focus:ring-gray-500 dark:focus:ring-gray-400", dayButton: "bg-gray-100 dark:bg-gray-900" },
      light: { input: "focus:ring-gray-500 dark:focus:ring-gray-400", dayButton: "bg-gray-100 dark:bg-gray-900" },
      alternative: { input: "focus:ring-alternative-500 dark:focus:ring-alternative-400", dayButton: "bg-alternative-100 dark:bg-alternative-900" },
      secondary: { input: "focus:ring-secondary-500 dark:focus:ring-secondary-400", dayButton: "bg-secondary-100 dark:bg-secondary-900" },
      gray: { input: "focus:ring-gray-500 dark:focus:ring-gray-400", dayButton: "bg-gray-100 dark:bg-gray-900" },
      orange: { input: "focus:ring-orange-500 dark:focus:ring-orange-400", dayButton: "bg-orange-100 dark:bg-orange-900" },
      amber: { input: "focus:ring-amber-500 dark:focus:ring-amber-400", dayButton: "bg-amber-100 dark:bg-amber-900" },
      lime: { input: "focus:ring-lime-500 dark:focus:ring-lime-400", dayButton: "bg-lime-100 dark:bg-lime-900" },
      emerald: { input: "focus:ring-emerald-500 dark:focus:ring-emerald-400", dayButton: "bg-emerald-100 dark:bg-emerald-900" },
      teal: { input: "focus:ring-teal-500 dark:focus:ring-teal-400", dayButton: "bg-teal-100 dark:bg-teal-900" },
      cyan: { input: "focus:ring-cyan-500 dark:focus:ring-cyan-400", dayButton: "bg-cyan-100 dark:bg-cyan-900" },
      sky: { input: "focus:ring-sky-500 dark:focus:ring-sky-400", dayButton: "bg-sky-100 dark:bg-sky-900" },
      indigo: { input: "focus:ring-indigo-500 dark:focus:ring-indigo-400", dayButton: "bg-indigo-100 dark:bg-indigo-900" },
      violet: { input: "focus:ring-violet-500 dark:focus:ring-violet-400", dayButton: "bg-violet-100 dark:bg-violet-900" },
      fuchsia: { input: "focus:ring-fuchsia-500 dark:focus:ring-fuchsia-400", dayButton: "bg-fuchsia-100 dark:bg-fuchsia-900" },
      pink: { input: "focus:ring-pink-500 dark:focus:ring-pink-400", dayButton: "bg-pink-100 dark:bg-pink-900" },
      rose: { input: "focus:ring-rose-500 dark:focus:ring-rose-400", dayButton: "bg-rose-100 dark:bg-rose-900" }
    },
    inline: {
      false: { base: "absolute z-10 mt-1" }
    },
    current: {
      true: { dayButton: "text-gray-400 dark:text-gray-500" }
    },
    today: {
      true: { dayButton: "font-bold" }
    }
  },
  compoundVariants: []
});
ce({
  slots: {
    div: "relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-xl h-[600px] w-[300px] shadow-xl",
    slot: "rounded-xl overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800",
    top: "w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute",
    leftTop: "h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg",
    leftMid: "h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg",
    leftBot: "h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg",
    right: "h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"
  }
});
ce({
  slots: {
    div: "relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px]",
    slot: "rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800",
    top: "h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg",
    leftTop: "h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg",
    leftBot: "h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg",
    right: "h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"
  }
});
ce({
  slots: {
    inner: "rounded-xl overflow-hidden h-[140px] md:h-[262px]",
    bot: "relative mx-auto bg-gray-900 dark:bg-gray-700 rounded-b-xl h-[24px] max-w-[301px] md:h-[42px] md:max-w-[512px]",
    botUnder: "relative mx-auto bg-gray-800 rounded-b-xl h-[55px] max-w-[83px] md:h-[95px] md:max-w-[142px]",
    div: "relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[16px] rounded-t-xl h-[172px] max-w-[301px] md:h-[294px] md:max-w-[512px]"
  }
});
ce({
  slots: {
    div: "relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl",
    slot: "rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800",
    top: "w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute",
    leftTop: "h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg",
    leftBot: "h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg",
    right: "h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"
  }
});
ce({
  slots: {
    div: "relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[8px] rounded-t-xl h-[172px] max-w-[301px] md:h-[294px] md:max-w-[512px]",
    inner: "rounded-lg overflow-hidden h-[156px] md:h-[278px] bg-white dark:bg-gray-800",
    bot: "relative mx-auto bg-gray-900 dark:bg-gray-700 rounded-b-xl rounded-t-sm h-[17px] max-w-[351px] md:h-[21px] md:max-w-[597px]",
    botCen: "absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl w-[56px] h-[5px] md:w-[96px] md:h-[8px] bg-gray-800"
  }
});
ce({
  slots: {
    div: "relative mx-auto bg-gray-800 dark:bg-gray-700 rounded-t-[2.5rem] h-[63px] max-w-[133px]",
    slot: "rounded-[2rem] overflow-hidden h-[193px] w-[188px]",
    rightTop: "h-[41px] w-[6px] bg-gray-800 dark:bg-gray-800 absolute -right-[16px] top-[40px] rounded-r-lg",
    rightBot: "h-[32px] w-[6px] bg-gray-800 dark:bg-gray-800 absolute -right-[16px] top-[88px] rounded-r-lg",
    top: "relative mx-auto border-gray-900 dark:bg-gray-800 dark:border-gray-800 border-[10px] rounded-[2.5rem] h-[213px] w-[208px]",
    bot: "relative mx-auto bg-gray-800 dark:bg-gray-700 rounded-b-[2.5rem] h-[63px] max-w-[133px]"
  }
});
ce({
  slots: {
    div: "relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[454px] max-w-[341px] md:h-[682px] md:max-w-[512px]",
    slot: "rounded-[2rem] overflow-hidden h-[426px] md:h-[654px] bg-white dark:bg-gray-800",
    leftTop: "h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg",
    leftMid: "h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg",
    leftBot: "h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg",
    right: "h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"
  }
});
ce({
  slots: {
    base: "mt-2 divide-y divide-gray-300 dark:divide-gray-500 overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-700",
    backdrop: "fixed top-0 start-0 w-full h-full"
  }
});
ce({
  base: "my-1 h-px bg-gray-100 dark:bg-gray-500"
});
ce({
  base: "px-4 py-3 text-sm text-gray-900 dark:text-white"
});
ce({
  slots: {
    anchor: "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white",
    activeAnchor: "block px-4 py-2 text-primary-700 dark:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
  }
});
ce({
  base: "py-2 text-sm text-gray-700 dark:text-gray-200"
});
ce({
  slots: {
    base: "overflow-y-auto z-50 p-4 bg-white dark:bg-gray-800",
    backdrop_: "fixed top-0 start-0 z-50 w-full h-full"
  },
  variants: {
    position: {
      fixed: { base: "fixed", backdrop_: "fixed" },
      absolute: { base: "absolute", backdrop_: "absolute" }
    },
    placement: {
      left: { base: "inset-y-0 start-0" },
      right: { base: "inset-y-0 end-0" },
      top: { base: "inset-x-0 top-0" },
      bottom: { base: "inset-x-0 bottom-0" }
    },
    width: {
      default: { base: "w-80" },
      full: { base: "w-full" },
      half: { base: "w-1/2" }
    },
    backdrop: {
      true: { backdrop_: "bg-gray-900 opacity-75" }
    }
  },
  defaultVariants: {
    position: "fixed",
    placement: "left",
    width: "default"
  }
});
ce({
  slots: {
    base: "flex items-center justify-between",
    button: "ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white",
    svg: "h-4 w-4"
  }
});
ce({
  base: "bg-white dark:bg-gray-800",
  variants: {
    footerType: {
      default: "p-4 rounded-lg shadow md:flex md:items-center md:justify-between md:p-6",
      sitemap: "bg-white dark:bg-gray-900",
      socialmedia: "p-4 sm:p-6",
      logo: "p-4 rounded-lg shadow md:px-6 md:py-8",
      sticky: "fixed bottom-0 left-0 z-20 w-full p-4 bg-white border-t border-gray-200 shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 dark:border-gray-600"
    }
  }
});
ce({
  slots: {
    base: "flex items-center",
    span: "self-center text-2xl font-semibold whitespace-nowrap dark:text-white",
    img: "me-3 h-8"
  }
});
ce({
  slots: {
    base: "block text-sm text-gray-500 sm:text-center dark:text-gray-400",
    link: "hover:underline",
    bySpan: "ms-1"
  }
});
ce({
  base: "text-gray-500 hover:text-gray-900 dark:hover:text-white"
});
ce({
  base: "text-gray-600 dark:text-gray-400"
});
ce({
  slots: {
    base: "me-4 last:me-0 md:me-6",
    link: "hover:underline"
  }
});
ce({
  slots: {
    image: "h-auto max-w-full rounded-lg",
    div: "grid"
  }
});
ce({
  slots: {
    base: "shrink-0"
  },
  variants: {
    color: {
      // 'primary' secondary 'gray' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose'
      primary: { base: "bg-primary-500" },
      secondary: { base: "bg-secondary-500" },
      gray: { base: "bg-gray-200" },
      red: { base: "bg-red-500" },
      orange: { base: "bg-orange-600" },
      amber: { base: "bg-amber-500" },
      yellow: { base: "bg-yellow-300" },
      lime: { base: "bg-lime-500" },
      green: { base: "bg-green-500" },
      emerald: { base: "bg-emerald-500" },
      teal: { base: "bg-teal-500" },
      cyan: { base: "bg-cyan-500" },
      sky: { base: "bg-sky-500" },
      blue: { base: "bg-blue-500" },
      indigo: { base: "bg-indigo-500" },
      violet: { base: "bg-violet-500" },
      purple: { base: "bg-purple-500" },
      fuchsia: { base: "bg-fuchsia-500" },
      pink: { base: "bg-pink-500" },
      rose: { base: "bg-rose-500" }
    },
    size: {
      xs: { base: "w-2 h-2" },
      sm: { base: "w-2.5 h-2.5" },
      md: { base: "w-3 h-3" },
      lg: { base: "w-3.5 h-3.5" },
      xl: { base: "w-6 h-6" }
    },
    cornerStyle: {
      rounded: { base: "rounded-sm" },
      circular: { base: "rounded-full" }
    },
    border: {
      true: { base: "border border-gray-300 dark:border-gray-300" },
      false: {}
    },
    hasChildren: {
      true: { base: "inline-flex items-center justify-center" },
      false: {}
    },
    placement: {
      default: { base: "" },
      "top-left": { base: "absolute top-0 start-0" },
      "top-center": {
        base: "absolute top-0 start-1/2 -translate-x-1/2 rtl:translate-x-1/2"
      },
      "top-right": { base: "absolute top-0 end-0" },
      "center-left": { base: "absolute top-1/2 -translate-y-1/2 start-0" },
      center: {
        base: "absolute top-1/2 -translate-y-1/2 start-1/2 -translate-x-1/2 rtl:translate-x-1/2"
      },
      "center-right": { base: "absolute top-1/2 -translate-y-1/2 end-0" },
      "bottom-left": { base: "absolute bottom-0 start-0" },
      "bottom-center": {
        base: "absolute bottom-0 start-1/2 -translate-x-1/2 rtl:translate-x-1/2"
      },
      "bottom-right": { base: "absolute bottom-0 end-0" }
    },
    offset: {
      true: {},
      false: {}
    }
  },
  compoundVariants: [
    {
      placement: "top-left",
      offset: true,
      class: { base: "-translate-x-1/3 rtl:translate-x-1/3 -translate-y-1/3" }
    },
    {
      placement: "top-center",
      offset: true,
      class: { base: "-translate-y-1/3" }
    },
    {
      placement: "top-right",
      offset: true,
      class: { base: "translate-x-1/3 rtl:-translate-x-1/3 -translate-y-1/3" }
    },
    {
      placement: "center-left",
      offset: true,
      class: { base: "-translate-x-1/3 rtl:translate-x-1/3" }
    },
    {
      placement: "center-right",
      offset: true,
      class: { base: "translate-x-1/3 rtl:-translate-x-1/3" }
    },
    {
      placement: "bottom-left",
      offset: true,
      class: { base: "-translate-x-1/3 rtl:translate-x-1/3 translate-y-1/3" }
    },
    {
      placement: "bottom-center",
      offset: true,
      class: { base: "translate-y-1/3" }
    },
    {
      placement: "bottom-right",
      offset: true,
      class: { base: "translate-x-1/3 rtl:-translate-x-1/3 translate-y-1/3" }
    }
  ],
  defaultVariants: {
    color: "primary",
    size: "md",
    cornerStyle: "circular",
    border: false,
    offset: true,
    hasChildren: false
  }
});
ce({
  base: "px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
});
ce({
  base: "flex bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 divide-gray-200 dark:divide-gray-600",
  variants: {
    rounded: {
      true: "rounded-lg",
      false: ""
    },
    border: {
      true: "border border-gray-200 dark:border-gray-700",
      false: ""
    },
    horizontal: {
      true: "flex-row divide-x",
      false: "flex-col divide-y"
    }
  },
  compoundVariants: [
    {
      border: true,
      class: "divide-gray-200 dark:divide-gray-700"
    }
  ],
  defaultVariants: {
    rounded: true,
    border: true,
    horizontal: false
  }
});
ce({
  base: "py-2 px-4 w-full text-sm font-medium list-none flex items-center text-left gap-2",
  variants: {
    state: {
      normal: "",
      current: "text-white bg-primary-700 dark:text-white dark:bg-gray-800",
      disabled: "text-gray-900 bg-gray-100 dark:bg-gray-600 dark:text-gray-400"
    },
    active: {
      true: "",
      false: ""
    },
    horizontal: {
      true: "first:rounded-s-lg last:rounded-e-lg",
      false: "first:rounded-t-lg last:rounded-b-lg"
    }
  },
  compoundVariants: [
    {
      active: true,
      state: "disabled",
      class: "cursor-not-allowed"
    },
    {
      active: true,
      state: "normal",
      class: "hover:bg-gray-100 hover:text-primary-700 dark:hover:bg-gray-600 dark:hover:text-white focus:z-40 focus:outline-hidden focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:focus:ring-gray-500 dark:focus:text-white"
    }
    // {
    //   horizontal: true,
    //   class: "focus:first:rounded-s-lg focus:last:rounded-e-lg"
    // },
    // {
    //   horizontal: false,
    //   class: "focus:first:rounded-t-lg focus:last:rounded-b-lg"
    // }
  ]
});
ce({
  slots: {
    base: "w-fit bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-100 dark:border-gray-600 divide-gray-100 dark:divide-gray-600",
    div: "flex flex-col md:flex-row p-4 max-w-(--breakpoint-md) justify-center mx-auto mt-2",
    ul: "grid grid-flow-row gap-y-4 md:gap-x-0 auto-col-max auto-row-max grid-cols-2 md:grid-cols-3 text-sm font-medium",
    extra: "md:w-1/3 mt-4 md:mt-0"
  },
  variants: {
    full: {
      true: { base: "border-y w-full ml-0 rounded-none" }
    },
    extra: {
      true: {}
    }
  },
  compoundVariants: [
    {
      full: true,
      extra: true,
      class: { ul: "grid-cols-2 md:w-2/3" }
    }
  ]
});
ce({
  slots: {
    base: "backdrop:bg-black/80 open:flex flex-col w-full max-h-[90hv] rounded-lg divide-y text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-800 divide-gray-300 dark:divide-gray-700 bg-white dark:bg-gray-800 pointer-events-auto",
    header: "flex items-center p-4 md:p-5 justify-between rounded-t-lg shrink-0 text-xl font-semibold text-gray-900 dark:text-white",
    footer: "flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse rounded-b-lg shrink-0",
    body: "p-4 md:p-5 space-y-4 overflow-y-auto overscroll-contain",
    closeBtn: "absolute top-3 end-2.5"
  },
  variants: {
    placement: {
      "top-left": { base: "top-0 left-0" },
      "top-center": { base: "top-0 left-1/2 -translate-x-1/2" },
      "top-right": { base: "top-0 left-full -translate-x-full" },
      "center-left": { base: "top-1/2 left-0 -translate-y-1/2" },
      center: { base: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" },
      "center-right": { base: "top-1/2 left-full -translate-x-full -translate-y-1/2" },
      "bottom-left": { base: "top-full -translate-y-full left-0" },
      "bottom-center": { base: "top-full -translate-y-full left-1/2 -translate-x-1/2" },
      "bottom-right": { base: "top-full -translate-y-full left-full -translate-x-full" }
    },
    size: {
      xs: { base: "max-w-md" },
      sm: { base: "max-w-lg" },
      md: { base: "max-w-2xl" },
      lg: { base: "max-w-4xl" },
      xl: { base: "max-w-7xl" }
    }
  },
  defaultVariants: {
    placement: "center",
    size: "md"
  }
});
ce({
  base: "relative w-full px-2 py-2.5 sm:px-4"
});
ce({
  base: "flex items-center"
});
ce({
  base: "mx-auto flex flex-wrap items-center justify-between ",
  variants: {
    fluid: { true: "w-full", false: "container" }
  }
});
ce({
  slots: {
    base: "w-full md:block md:w-auto",
    ul: "flex flex-col p-4 mt-0 md:flex-row rtl:space-x-reverse md:text-sm md:font-medium",
    active: "text-white bg-primary-700 md:bg-transparent md:text-primary-700 md:dark:text-white dark:bg-primary-600 md:dark:bg-transparent",
    nonActive: "hover:text-primary-500 text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary-700 dark:text-gray-400 dark:md:text-white md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
  },
  variants: {
    hidden: {
      false: {
        // Add absolute positioning and overlay styles for mobile
        base: "absolute top-full left-0 right-0 z-50 w-full md:block md:w-auto md:static md:z-auto",
        ul: "border rounded-lg bg-white shadow-lg dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-400 border-gray-100 dark:border-gray-700 divide-gray-100 dark:divide-gray-700 md:border-none md:rounded-none md:bg-inherit dark:md:bg-inherit md:shadow-none"
      },
      true: {
        base: "hidden"
      }
    }
  },
  defaultVariants: {}
});
ce({
  base: "block py-2 pe-4 ps-3 md:p-2 rounded-sm md:border-0",
  variants: {
    hidden: {
      false: "block py-2 pe-4 ps-3 md:p-2 rounded-sm text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
    }
  },
  defaultVariants: {}
});
ce({
  slots: {
    base: "ms-3 md:hidden",
    menu: "h-6 w-6 shrink-0"
  }
});
ce({
  slots: {
    base: "flex justify-between items-center",
    content: "flex flex-wrap items-center"
  },
  variants: {
    embedded: {
      true: {},
      false: {
        base: "py-2 px-3 rounded-lg dark:border"
      }
    },
    color: {
      default: {
        base: "bg-gray-50 dark:bg-gray-800 dark:border-gray-600",
        content: "divide-gray-300 dark:divide-gray-800"
      },
      primary: {
        base: "bg-primary-50 dark:bg-gray-800 dark:border-primary-800",
        content: "divide-primary-300 dark:divide-primary-800"
      },
      secondary: {
        base: "bg-secondary-50 dark:bg-gray-800 dark:border-secondary-800",
        content: "divide-secondary-300 dark:divide-primary-800"
      },
      gray: {
        base: "bg-gray-50 dark:bg-gray-800 dark:border-gray-800",
        content: "divide-gray-300 dark:divide-gray-800"
      },
      red: {
        base: "bg-red-50 dark:bg-gray-800 dark:border-red-800",
        content: "divide-red-300 dark:divide-red-800"
      },
      yellow: {
        base: "bg-yellow-50 dark:bg-gray-800 dark:border-yellow-800",
        content: "divide-yellow-300 dark:divide-yellow-800"
      },
      green: {
        base: "bg-green-50 dark:bg-gray-800 dark:border-green-800",
        content: "divide-green-300 dark:divide-green-800"
      },
      indigo: {
        base: "bg-indigo-50 dark:bg-gray-800 dark:border-indigo-800",
        content: "divide-indigo-300 dark:divide-indigo-800"
      },
      purple: {
        base: "bg-purple-50 dark:bg-gray-800 dark:border-purple-800",
        content: "divide-purple-300 dark:divide-purple-800"
      },
      pink: {
        base: "bg-pink-50 dark:bg-gray-800 dark:border-pink-800",
        content: "divide-pink-300 dark:divide-pink-800"
      },
      blue: {
        base: "bg-blue-50 dark:bg-gray-800 dark:border-blue-800",
        content: "divide-blue-300 dark:divide-blue-800"
      },
      dark: {
        base: "bg-gray-50 dark:bg-gray-800 dark:border-gray-800",
        content: "divide-gray-300 dark:divide-gray-800"
      }
    },
    separators: {
      true: {
        content: "sm:divide-x rtl:divide-x-reverse"
      }
    }
  },
  compoundVariants: [
    {
      embedded: true,
      color: "default",
      class: {
        base: "bg-transparent"
      }
    }
  ],
  defaultVariants: {
    color: "default"
  }
});
ce({
  base: "flex items-center",
  variants: {
    spacing: {
      default: "space-x-1 rtl:space-x-reverse",
      tight: "space-x-0.5 rtl:space-x-reverse",
      loose: "space-x-2 rtl:space-x-reverse"
    },
    padding: {
      default: "sm:not(:last):pe-4 sm:not(:first):ps-4",
      none: ""
    },
    position: {
      middle: "",
      first: "sm:ps-0",
      last: "sm:pe-0"
    }
  },
  compoundVariants: [
    {
      position: ["first", "last"],
      class: "sm:px-0"
    }
  ],
  defaultVariants: {
    spacing: "default",
    padding: "default"
  }
});
ce({
  base: "focus:outline-hidden whitespace-normal",
  variants: {
    color: {
      dark: "text-gray-500 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600",
      gray: "text-gray-500 focus:ring-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-300",
      red: "text-red-500 focus:ring-red-400 hover:bg-red-200 dark:hover:bg-red-800 dark:hover:text-red-300",
      yellow: "text-yellow-500 focus:ring-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-800 dark:hover:text-yellow-300",
      green: "text-green-500 focus:ring-green-400 hover:bg-green-200 dark:hover:bg-green-800 dark:hover:text-green-300",
      indigo: "text-indigo-500 focus:ring-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 dark:hover:text-indigo-300",
      purple: "text-purple-500 focus:ring-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800 dark:hover:text-purple-300",
      pink: "text-pink-500 focus:ring-pink-400 hover:bg-pink-200 dark:hover:bg-pink-800 dark:hover:text-pink-300",
      blue: "text-blue-500 focus:ring-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 dark:hover:text-blue-300",
      primary: "text-primary-500 focus:ring-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 dark:hover:text-primary-300",
      default: "focus:ring-gray-400 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-50"
    },
    size: {
      xs: "m-0.5 rounded-xs focus:ring-1 p-0.5",
      sm: "m-0.5 rounded-sm focus:ring-1 p-0.5",
      md: "m-0.5 rounded-lg focus:ring-2 p-1.5",
      lg: "m-0.5 rounded-lg focus:ring-2 p-2.5"
    },
    background: {
      true: "",
      false: ""
    }
  },
  compoundVariants: [
    {
      color: "default",
      background: true,
      class: "dark:hover:bg-gray-600"
    },
    {
      color: "default",
      background: false,
      class: "dark:hover:bg-gray-700"
    }
  ],
  defaultVariants: {
    color: "default",
    size: "md"
  }
});
ce({
  slots: {
    base: "inline-flex -space-x-px rtl:space-x-reverse items-center",
    tableDiv: "flex items-center text-sm mb-4",
    tableSpan: "font-semibold mx-1",
    prevItem: "rounded-none",
    nextItem: "rounded-none"
  },
  variants: {
    size: {
      default: "",
      large: ""
    },
    layout: {
      table: { prevItem: "rounded-s bg-gray-800 hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white text-white  hover:text-gray-200", nextItem: "text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900 hover:text-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" },
      navigation: { prevItem: "rounded-s-lg", nextItem: "rounded-e-lg" },
      pagination: { prevItem: "rounded-s-lg", nextItem: "rounded-e-lg" }
    }
  },
  defaultVariants: {
    table: false,
    size: "default"
  }
});
ce({
  base: "flex items-center font-medium",
  variants: {
    size: {
      default: "h-8 px-3 text-sm",
      large: "h-10 px-4 text-base"
    },
    active: {
      true: "text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white",
      false: "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
    },
    group: {
      true: "",
      false: "rounded-lg"
    },
    table: {
      true: "rounded-sm",
      false: "border"
    },
    disabled: {
      true: "cursor-not-allowed opacity-50",
      false: ""
    }
  },
  compoundVariants: [
    {
      group: false,
      table: false,
      class: "rounded-lg"
    }
  ],
  defaultVariants: {
    size: "default",
    active: false,
    group: false,
    table: false
  }
});
const paginationItem = ce({
  base: "flex items-center font-medium",
  variants: {
    size: {
      default: "h-8 px-3 text-sm",
      large: "h-10 px-4 text-base"
    },
    active: {
      true: "text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white",
      false: "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
    },
    group: {
      true: "",
      false: "rounded-lg"
    },
    table: {
      true: "rounded-sm",
      false: "border"
    }
  },
  compoundVariants: [
    {
      group: false,
      table: false,
      class: "rounded-lg"
    }
  ],
  defaultVariants: {
    size: "default",
    active: false,
    group: false,
    table: false
  }
});
const pagination = ce({
  base: "inline-flex -space-x-px rtl:space-x-reverse items-center",
  variants: {
    table: {
      true: "divide-x rtl:divide-x-reverse dark divide-gray-700 dark:divide-gray-700",
      false: ""
    },
    size: {
      default: "",
      large: ""
    }
  },
  defaultVariants: {
    table: false,
    size: "default"
  }
});
function Pagination($$payload, $$props) {
  push();
  let {
    pages = [],
    previous,
    next,
    prevContent,
    nextContent,
    table,
    size,
    ariaLabel,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  setContext("group", true);
  setContext("table", table);
  setContext("size", size);
  const paginationClass = pagination({ table, size });
  const each_array = ensure_array_like(pages);
  $$payload.out += `<nav${attr("aria-label", ariaLabel)}><ul${attr_class(clsx(paginationClass))}>`;
  if (typeof previous === "function") {
    $$payload.out += "<!--[-->";
    $$payload.out += `<li${spread_attributes({ ...restProps })}>`;
    PaginationItem($$payload, {
      size,
      onclick: () => previous(),
      class: table ? "rounded-none rounded-l" : "rounded-none  rounded-s-lg",
      children: ($$payload2) => {
        if (prevContent) {
          $$payload2.out += "<!--[-->";
          prevContent($$payload2);
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `Previous`;
        }
        $$payload2.out += `<!--]-->`;
      },
      $$slots: { default: true }
    });
    $$payload.out += `<!----></li>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let { name, href, active, size: size2 } = each_array[$$index];
    $$payload.out += `<li${spread_attributes({ ...restProps })}>`;
    PaginationItem($$payload, {
      size: size2,
      active,
      href,
      children: ($$payload2) => {
        $$payload2.out += `<!---->${escape_html(name)}`;
      },
      $$slots: { default: true }
    });
    $$payload.out += `<!----></li>`;
  }
  $$payload.out += `<!--]--> `;
  if (typeof next === "function") {
    $$payload.out += "<!--[-->";
    $$payload.out += `<li${spread_attributes({ ...restProps })}>`;
    PaginationItem($$payload, {
      size,
      onclick: () => next(),
      class: table ? "rounded-none rounded-r" : "rounded-none rounded-e-lg",
      children: ($$payload2) => {
        if (nextContent) {
          $$payload2.out += "<!--[-->";
          nextContent($$payload2);
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `Next`;
        }
        $$payload2.out += `<!--]-->`;
      },
      $$slots: { default: true }
    });
    $$payload.out += `<!----></li>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></ul></nav>`;
  pop();
}
function PaginationItem($$payload, $$props) {
  push();
  let {
    children,
    size,
    class: className,
    href,
    active,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const group = getContext("group");
  const table = getContext("table");
  const paginationCls = twMerge$1(
    paginationItem({
      size: getContext("size") ?? size,
      active,
      group,
      table
    }),
    clsx$1(className)
  );
  if (href) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<a${spread_attributes(
      {
        href,
        ...restProps,
        class: clsx(paginationCls)
      }
    )}>`;
    if (children) {
      $$payload.out += "<!--[-->";
      children($$payload);
      $$payload.out += `<!---->`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--></a>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes(
      {
        ...restProps,
        class: clsx(paginationCls)
      }
    )}>`;
    if (children) {
      $$payload.out += "<!--[-->";
      children($$payload);
      $$payload.out += `<!---->`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--></button>`;
  }
  $$payload.out += `<!--]-->`;
  pop();
}
ce({
  slots: {
    base: "rounded-lg shadow-md bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700",
    content: "p-2",
    title: "py-2 px-3 rounded-t-md border-b ",
    h3: "font-semibold",
    arrowBase: "absolute pointer-events-none block w-[10px] h-[10px] rotate-45 bg-inherit border-inherit shadow-md"
  },
  variants: {
    color: {
      default: {
        title: "bg-gray-100 border-gray-200 dark:border-gray-600 dark:bg-gray-700",
        h3: "text-gray-900 dark:text-white"
      },
      primary: {
        title: "bg-primary-700",
        h3: "text-white"
      },
      secondary: {
        title: "bg-secondary-700",
        h3: "text-white"
      },
      gray: {
        title: "bg-gray-700",
        h3: "text-white"
      },
      red: {
        title: "bg-red-700",
        h3: "text-white"
      },
      orange: {
        title: "bg-orange-700",
        h3: "text-white"
      },
      amber: {
        title: "bg-amber-700",
        h3: "text-white"
      },
      yellow: {
        title: "bg-yellow-500",
        h3: "text-gray-800"
      },
      lime: {
        title: "bg-lime-700",
        h3: "text-white"
      },
      green: {
        title: "bg-green-700",
        h3: "text-white"
      },
      emerald: {
        title: "bg-emerald-700",
        h3: "text-white"
      },
      teal: {
        title: "bg-teal-700",
        h3: "text-white"
      },
      cyan: {
        title: "bg-cyan-700",
        h3: "text-white"
      },
      sky: {
        title: "bg-sky-700",
        h3: "text-white"
      },
      blue: {
        title: "bg-blue-700",
        h3: "text-white"
      },
      indigo: {
        title: "bg-indigo-700",
        h3: "text-white"
      },
      violet: {
        title: "bg-violet-700",
        h3: "text-white"
      },
      purple: {
        title: "bg-purple-700",
        h3: "text-white"
      },
      fuchsia: {
        title: "bg-fuchsia-700",
        h3: "text-white"
      },
      pink: {
        title: "bg-pink-700",
        h3: "text-white"
      },
      rose: {
        title: "bg-rose-700",
        h3: "text-white"
      }
    }
  }
});
ce({
  slots: {
    base: "w-full bg-gray-200 rounded-full dark:bg-gray-700",
    labelInsideDiv: "text-primary-100 text-xs font-medium text-center leading-none rounded-full",
    insideDiv: "rounded-full",
    outsideDiv: "mb-1 flex justify-between",
    oustsideSpan: "text-base font-medium dark:text-white",
    outsideProgress: "text-sm font-medium dark:text-white"
  },
  variants: {
    color: {
      primary: {
        labelInsideDiv: "bg-primary-600",
        insideDiv: "bg-primary-600"
      },
      secondary: {
        labelInsideDiv: "bg-secondary-600",
        insideDiv: "bg-secondary-600"
      },
      gray: {
        labelInsideDiv: "bg-gray-600 dark:bg-gray-300",
        insideDiv: "bg-gray-600 dark:bg-gray-300"
      },
      red: {
        labelInsideDiv: "bg-red-600 dark:bg-red-500",
        insideDiv: "bg-red-600 dark:bg-red-500"
      },
      orange: {
        labelInsideDiv: "bg-orange-600 dark:bg-orange-500",
        insideDiv: "bg-orange-600 dark:bg-orange-500"
      },
      amber: {
        labelInsideDiv: "bg-amber-600 dark:bg-amber-500",
        insideDiv: "bg-amber-600 dark:bg-amber-500"
      },
      yellow: {
        labelInsideDiv: "bg-yellow-400",
        insideDiv: "bg-yellow-400"
      },
      lime: {
        labelInsideDiv: "bg-lime-600 dark:bg-lime-500",
        insideDiv: "bg-lime-600 dark:bg-lime-500"
      },
      green: {
        labelInsideDiv: "bg-green-600 dark:bg-green-500",
        insideDiv: "bg-green-600 dark:bg-green-500"
      },
      emerald: {
        labelInsideDiv: "bg-emerald-600 dark:bg-emerald-500",
        insideDiv: "bg-emerald-600 dark:bg-emerald-500"
      },
      teal: {
        labelInsideDiv: "bg-teal-600 dark:bg-teal-500",
        insideDiv: "bg-teal-600 dark:bg-teal-500"
      },
      cyan: {
        labelInsideDiv: "bg-cyan-600 dark:bg-cyan-500",
        insideDiv: "bg-cyan-600 dark:bg-cyan-500"
      },
      sky: {
        labelInsideDiv: "bg-sky-600 dark:bg-sky-500",
        insideDiv: "bg-sky-600 dark:bg-sky-500"
      },
      blue: {
        labelInsideDiv: "bg-blue-600",
        insideDiv: "bg-blue-600"
      },
      indigo: {
        labelInsideDiv: "bg-indigo-600 dark:bg-indigo-500",
        insideDiv: "bg-indigo-600 dark:bg-indigo-500"
      },
      violet: {
        labelInsideDiv: "bg-violet-600 dark:bg-violet-500",
        insideDiv: "bg-violet-600 dark:bg-violet-500"
      },
      purple: {
        labelInsideDiv: "bg-purple-600 dark:bg-purple-500",
        insideDiv: "bg-purple-600 dark:bg-purple-500"
      },
      fuchsia: {
        labelInsideDiv: "bg-fuchsia-600 dark:bg-fuchsia-500",
        insideDiv: "bg-fuchsia-600 dark:bg-fuchsia-500"
      },
      pink: {
        labelInsideDiv: "bg-pink-600 dark:bg-pink-500",
        insideDiv: "bg-pink-600 dark:bg-pink-500"
      },
      rose: {
        labelInsideDiv: "bg-rose-600 dark:bg-rose-500",
        insideDiv: "bg-rose-600 dark:bg-rose-500"
      }
    },
    labelInside: {
      true: "",
      false: ""
    }
  },
  compoundVariants: [
    {
      labelInside: true,
      class: {
        base: "text-primary-100 text-xs font-medium text-center leading-none rounded-full",
        labelInsideDiv: "p-0.5"
      }
    },
    {
      labelInside: false,
      class: { base: "rounded-full" }
    }
  ],
  defaultVariants: {
    color: "primary",
    labelInside: false
  }
});
ce({
  slots: {
    base: "relative inline-flex",
    labelInsideDiv: "absolute inset-0 flex items-center justify-center text-sm font-medium",
    circleBackground: "opacity-25",
    circleForeground: "transition-all",
    outsideDiv: "flex flex-col items-center mb-2 text-center",
    outsideSpan: "text-base font-medium",
    outsideProgress: "text-sm font-medium ml-1"
  },
  variants: {
    color: {
      primary: {
        circleBackground: "stroke-primary-600",
        circleForeground: "stroke-primary-600"
      },
      secondary: {
        circleBackground: "stroke-secondary-600",
        circleForeground: "stroke-secondary-600"
      },
      gray: {
        circleBackground: "stroke-gray-600 dark:stroke-gray-300",
        circleForeground: "stroke-gray-600 dark:stroke-gray-300"
      },
      red: {
        circleBackground: "stroke-red-600 dark:stroke-red-500",
        circleForeground: "stroke-red-600 dark:stroke-red-500"
      },
      orange: {
        circleBackground: "stroke-orange-600 dark:stroke-orange-500",
        circleForeground: "stroke-orange-600 dark:stroke-orange-500"
      },
      amber: {
        circleBackground: "stroke-amber-600 dark:stroke-amber-500",
        circleForeground: "stroke-amber-600 dark:stroke-amber-500"
      },
      yellow: {
        circleBackground: "stroke-yellow-400",
        circleForeground: "stroke-yellow-400"
      },
      lime: {
        circleBackground: "stroke-lime-600 dark:stroke-lime-500",
        circleForeground: "stroke-lime-600 dark:stroke-lime-500"
      },
      green: {
        circleBackground: "stroke-green-600 dark:stroke-green-500",
        circleForeground: "stroke-green-600 dark:stroke-green-500"
      },
      emerald: {
        circleBackground: "stroke-emerald-600 dark:stroke-emerald-500",
        circleForeground: "stroke-emerald-600 dark:stroke-emerald-500"
      },
      teal: {
        circleBackground: "stroke-teal-600 dark:stroke-teal-500",
        circleForeground: "stroke-teal-600 dark:stroke-teal-500"
      },
      cyan: {
        circleBackground: "stroke-cyan-600 dark:stroke-cyan-500",
        circleForeground: "stroke-cyan-600 dark:stroke-cyan-500"
      },
      sky: {
        circleBackground: "stroke-sky-600 dark:stroke-sky-500",
        circleForeground: "stroke-sky-600 dark:stroke-sky-500"
      },
      blue: {
        circleBackground: "stroke-blue-600",
        circleForeground: "stroke-blue-600"
      },
      indigo: {
        circleBackground: "stroke-indigo-600 dark:stroke-indigo-500",
        circleForeground: "stroke-indigo-600 dark:stroke-indigo-500"
      },
      violet: {
        circleBackground: "stroke-violet-600 dark:stroke-violet-500",
        circleForeground: "stroke-violet-600 dark:stroke-violet-500"
      },
      purple: {
        circleBackground: "stroke-purple-600 dark:stroke-purple-500",
        circleForeground: "stroke-purple-600 dark:stroke-purple-500"
      },
      fuchsia: {
        circleBackground: "stroke-fuchsia-600 dark:stroke-fuchsia-500",
        circleForeground: "stroke-fuchsia-600 dark:stroke-fuchsia-500"
      },
      pink: {
        circleBackground: "stroke-pink-600 dark:stroke-pink-500",
        circleForeground: "stroke-pink-600 dark:stroke-pink-500"
      },
      rose: {
        circleBackground: "stroke-rose-600 dark:stroke-rose-500",
        circleForeground: "stroke-rose-600 dark:stroke-rose-500"
      }
    },
    labelInside: {
      true: {}
    }
  }
});
ce({
  // divClass = 'flex items-center mt-4', spanClass = 'text-sm font-medium text-gray-600 dark:text-gray-500', div2Class = 'mx-4 w-2/4 h-5 bg-gray-200 rounded-sm dark:bg-gray-700', div3Class = 'h-5 bg-yellow-400 rounded-sm', span2Class = 'text-sm font-medium text-gray-600 dark:text-gray-500',
  slots: {
    base: "flex items-center mt-4",
    span: "text-sm font-medium text-gray-600 dark:text-gray-500",
    div2: "mx-4 w-2/4 h-5 bg-gray-200 rounded-sm dark:bg-gray-700",
    div3: "h-5 bg-yellow-400 rounded-sm",
    span2: "text-sm font-medium text-gray-600 dark:text-gray-500"
  }
});
ce({
  slots: {
    base: "flex items-center",
    p: "ms-2 text-sm font-bold text-gray-900 dark:text-white"
  }
});
ce({
  slots: {
    article: "md:grid md:grid-cols-3 md:gap-8",
    div: "mb-6 flex items-center space-x-4 rtl:space-x-reverse",
    div2: "space-y-1 font-medium dark:text-white",
    div3: "flex items-center text-sm text-gray-500 dark:text-gray-400",
    img: "h-10 w-10 rounded-full",
    ul: "space-y-4 text-sm text-gray-500 dark:text-gray-400",
    li: "flex items-center"
  }
});
ce({
  slots: {
    desc1: "bg-primary-100 w-8 text-primary-800 text-sm font-semibold inline-flex items-center p-1.5 rounded-sm dark:bg-primary-200 dark:text-primary-800",
    desc2: "ms-2 font-medium text-gray-900 dark:text-white",
    desc3: "mx-2 w-1 h-1 mx-2 bg-gray-900 rounded-full dark:bg-gray-500",
    desc3span: "text-sm w-24 font-medium text-gray-500 dark:text-gray-400",
    desc3p: "text-sm w-24 font-medium text-gray-500 dark:text-gray-400",
    link: "ms-auto w-32 text-sm font-medium text-primary-600 hover:underline dark:text-primary-500",
    bar: "bg-primary-600 h-2.5 rounded-sm dark:bg-primary-500"
  }
});
ce({
  slots: {
    base: "top-0 left-0 z-50 w-64 transition-transform bg-gray-50 dark:bg-gray-800",
    active: "flex items-center group-has-[ul]:ms-6 p-2 text-base font-normal text-gray-900 bg-gray-200 dark:bg-gray-700 rounded-sm dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700",
    nonactive: "flex items-center group-has-[ul]:ms-6 p-2 text-base font-normal text-gray-900 rounded-sm dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700",
    div: "overflow-y-auto px-3 py-4 bg-gray-50 dark:bg-gray-800",
    backdrop: "fixed top-0 start-0 z-40 w-full h-full"
  },
  variants: {
    position: {
      fixed: { base: "fixed" },
      absolute: { base: "absolute" },
      static: { base: "static" }
    },
    isOpen: {
      true: "block",
      false: "hidden"
    },
    breakpoint: {
      sm: { base: "sm:block" },
      md: { base: "md:block" },
      lg: { base: "lg:block" },
      xl: { base: "xl:block" },
      "2xl": { base: "2xl:block" }
    },
    alwaysOpen: {
      true: { base: "block" }
      // Always display the sidebar when alwaysOpen is true
    },
    backdrop: {
      true: { backdrop: "bg-gray-900 opacity-75" }
    }
  },
  compoundVariants: [
    // When alwaysOpen is true, override the breakpoint display classes
    {
      alwaysOpen: true,
      class: {
        base: "!block"
      }
    }
  ]
});
ce({
  base: "inline-flex items-center p-0 mt-0 ms-3 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-hidden focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600",
  variants: {
    breakpoint: {
      sm: "sm:hidden",
      md: "md:hidden",
      lg: "lg:hidden",
      xl: "xl:hidden",
      "2xl": "2xl:hidden"
    }
  }
});
ce({
  slots: {
    base: "p-4 mt-6 bg-primary-50 rounded-lg dark:bg-primary-900",
    div: "flex items-center mb-3",
    span: "bg-primary-100 text-primary-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded-sm dark:bg-primary-200 dark:text-primary-900"
  }
});
ce({
  slots: {
    base: "flex items-center ps-2.5 mb-5",
    img: "h-6 me-3 sm:h-7",
    span: "self-center text-xl font-semibold whitespace-nowrap dark:text-white"
  }
});
ce({
  slots: {
    base: "group",
    btn: "flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-sm transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
    span: "flex-1 ms-3 text-left whitespace-nowrap",
    svg: "h-3 w-3 text-gray-800 dark:text-white",
    ul: "py-2 space-y-0"
  }
});
ce({
  slots: {
    base: "p-4 rounded-sm border border-gray-200 shadow-sm animate-pulse md:p-6 dark:border-gray-700",
    imageArea: "mb-4 flex h-48 items-center justify-center rounded-sm bg-gray-300 dark:bg-gray-700",
    imageIcon: "text-gray-200 dark:text-gray-600",
    line: "rounded-full bg-gray-200 dark:bg-gray-700",
    footerArea: "mt-4 flex items-center space-x-3 rtl:space-x-reverse"
  },
  variants: {
    size: {
      sm: { base: "max-w-sm" },
      md: { base: "max-w-md" },
      lg: { base: "max-w-lg" },
      xl: { base: "max-w-xl" },
      "2xl": { base: "max-w-2xl" }
    }
  }
});
ce({
  slots: {
    base: "space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center",
    image: "flex w-full items-center justify-center rounded-sm bg-gray-300 sm:w-96 dark:bg-gray-700",
    svg: "text-gray-200",
    content: "w-full",
    line: "rounded-full bg-gray-200 dark:bg-gray-700"
  },
  variants: {
    size: {
      sm: {
        image: "h-32",
        content: "space-y-2"
      },
      md: {
        image: "h-48",
        content: "space-y-3"
      },
      lg: {
        image: "h-64",
        content: "space-y-4"
      }
    },
    rounded: {
      none: {
        image: "rounded-none",
        line: "rounded-none"
      },
      sm: {
        image: "rounded-xs",
        line: "rounded-xs"
      },
      md: {
        image: "rounded-sm",
        line: "rounded-sm"
      },
      lg: {
        image: "rounded-lg",
        line: "rounded-lg"
      },
      full: {
        image: "rounded-full",
        line: "rounded-full"
      }
    }
  }
});
ce({
  slots: {
    base: "p-4 space-y-4 max-w-md rounded-sm border border-gray-200 divide-y divide-gray-200 shadow-sm animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700",
    item: "flex items-center justify-between",
    itemContent: "",
    itemTitle: "mb-2.5 h-2.5 w-24 rounded-full bg-gray-300 dark:bg-gray-600",
    itemSubtitle: "h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700",
    itemExtra: "h-2.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700"
  },
  variants: {
    size: {
      sm: {
        base: "p-3 space-y-3 max-w-sm md:p-4",
        itemTitle: "mb-2 h-2 w-20",
        itemSubtitle: "h-1.5 w-28",
        itemExtra: "h-2 w-10"
      },
      md: {},
      // default size
      lg: {
        base: "p-5 space-y-5 max-w-lg md:p-7",
        itemTitle: "mb-3 h-3 w-28",
        itemSubtitle: "h-2.5 w-36",
        itemExtra: "h-3 w-14"
      }
    },
    rounded: {
      none: { base: "rounded-none" },
      sm: { base: "rounded-xs" },
      md: { base: "rounded-sm" },
      lg: { base: "rounded-lg" },
      full: { base: "rounded-full p-8 md:p-16" }
    }
  }
});
ce({
  slots: {
    wrapper: "animate-pulse",
    line: "rounded-full bg-gray-200 dark:bg-gray-700"
  },
  variants: {
    size: {
      sm: {
        wrapper: "max-w-sm"
      },
      md: {
        wrapper: "max-w-md"
      },
      lg: {
        wrapper: "max-w-lg"
      },
      xl: {
        wrapper: "max-w-xl"
      },
      "2xl": {
        wrapper: "max-w-2xl"
      }
    }
  }
});
ce({
  slots: {
    wrapper: "animate-pulse",
    line1: "rounded-full bg-gray-200 dark:bg-gray-700",
    line2: "rounded-full bg-gray-300 dark:bg-gray-700",
    svg: "me-2 h-10 w-10 text-gray-200 dark:text-gray-700",
    subContent: "mt-4 flex items-center justify-center"
  }
});
ce({
  slots: {
    baseWrapper: "space-y-2.5 animate-pulse",
    divWrapper: "flex items-center space-x-2 rtl:space-x-reverse",
    lineA: "rounded-full bg-gray-200 dark:bg-gray-700",
    lineB: "rounded-full bg-gray-300 dark:bg-gray-600"
  },
  variants: {
    size: {
      sm: { baseWrapper: "max-w-sm" },
      md: { baseWrapper: "max-w-md" },
      lg: { baseWrapper: "max-w-lg" },
      xl: { baseWrapper: "max-w-xl" },
      "2xl": { baseWrapper: "max-w-2xl" }
    }
  }
});
ce({
  base: "flex justify-center items-center h-56 bg-gray-300 rounded-lg animate-pulse dark:bg-gray-700",
  variants: {
    size: {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl"
    }
  }
});
ce({
  slots: {
    base: "p-4 max-w-sm rounded-sm border border-gray-200 shadow-sm animate-pulse md:p-6 dark:border-gray-700",
    wrapper: "mt-4 flex items-baseline space-x-6 rtl:space-x-reverse",
    hLine: "rounded-full bg-gray-200 dark:bg-gray-700",
    vLine: "w-full rounded-t-lg bg-gray-200 dark:bg-gray-700"
  }
});
ce({
  slots: {
    base: "group bg-transparent",
    popper: "flex items-center gap-2 bg-transparent text-inherit"
  },
  variants: {
    vertical: {
      true: { popper: "flex-col" }
    }
  },
  defaultVariants: {
    vertical: false
  }
});
ce({
  slots: {
    base: "w-[52px] h-[52px] shadow-xs p-0",
    span: "block mb-px text-xs font-medium"
  },
  variants: {
    textOutside: {
      true: {
        base: "relative",
        span: "absolute -start-12 top-1/2 mb-px text-sm font-medium -translate-y-1/2"
      }
    },
    tooltip: {
      true: {
        base: "flex-col"
      }
    }
  },
  defaultVariants: {}
});
ce({
  slots: {
    base: "absolute px-3 py-2 rounded-lg text-sm z-50 pointer-events-none",
    arrowBase: ""
  },
  variants: {
    type: {
      light: { base: "bg-white text-gray-800 dark:bg-white dark:text-gray-800 border border-gray-200 dark:border-gray-200" },
      auto: { base: "bg-white text-gray-800 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700" },
      dark: { base: "bg-gray-800 text-white dark:bg-gray-800 dark:text-white dark:border dark:border-gray-700" }
    },
    color: {
      // default: { base: "bg-gray-800 dark:bg-gray-300 dark:text-gray-800" },
      primary: { base: "bg-primary-600 dark:bg-primary-600" },
      secondary: { base: "bg-secondary-600 dark:bg-secondary-600" },
      gray: { base: "bg-gray-600 dark:bg-gray-600" },
      red: { base: "bg-red-600 dark:bg-red-600" },
      orange: { base: "bg-orange-600 dark:bg-orange-600" },
      amber: { base: "bg-amber-600 dark:bg-amber-600" },
      yellow: { base: "bg-yellow-400 dark:bg-yellow-400" },
      lime: { base: "bg-lime-600 dark:bg-lime-600" },
      green: { base: "bg-green-600 dark:bg-green-600" },
      emerald: { base: "bg-emerald-600 dark:bg-emerald-600" },
      teal: { base: "bg-teal-600 dark:bg-teal-600" },
      cyan: { base: "bg-cyan-600 dark:bg-cyan-600" },
      sky: { base: "bg-sky-600 dark:bg-sky-600" },
      blue: { base: "bg-blue-600 dark:bg-blue-600" },
      indigo: { base: "bg-indigo-600 dark:bg-indigo-600" },
      violet: { base: "bg-violet-600 dark:bg-violet-600" },
      purple: { base: "bg-purple-600 dark:bg-purple-600" },
      fuchsia: { base: "bg-fuchsia-600 dark:bg-fuchsia-600" },
      pink: { base: "bg-pink-600 dark:bg-pink-600" },
      rose: { base: "bg-rose-800 dark:bg-rose-800" }
    }
  }
});
ce({
  base: "inline-block animate-spin text-gray-300",
  variants: {
    color: {
      // primary, secondary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
      primary: "fill-primary-600",
      secondary: "fill-secondary-600",
      gray: "fill-gray-600 dark:fill-gray-300",
      red: "fill-red-600",
      orange: "fill-orange-500",
      amber: "fill-amber-500",
      yellow: "fill-yellow-400",
      lime: "fill-lime-500",
      green: "fill-green-500",
      emerald: "fill-emerald-500",
      teal: "fill-teal-500",
      cyan: "fill-cyan-500",
      sky: "fill-sky-500",
      blue: "fill-blue-600",
      indigo: "fill-indigo-600",
      violet: "fill-violet-600",
      purple: "fill-purple-600",
      fuchsia: "fill-fuchsia-600",
      pink: "fill-pink-600",
      rose: "fill-rose-600"
    },
    size: {
      "4": "w-4 h-4",
      "5": "w-5 h-5",
      "6": "w-6 h-6",
      "8": "w-8 h-8",
      "10": "w-10 h-10",
      "12": "w-12 h-12",
      "16": "w-16 h-16"
    }
  },
  defaultVariants: {
    color: "primary",
    size: "8"
  }
});
ce({
  base: "flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base"
});
ce({
  base: "flex items-center",
  variants: {
    status: {
      completed: ["text-primary-600", "dark:text-primary-500", "md:w-full", "sm:after:content-['']", "after:w-full", "after:h-1", "after:border-b", "after:border-gray-200", "after:border-1", "after:hidden", "sm:after:inline-block", "after:mx-6", "xl:after:mx-10", "dark:after:border-gray-700"],
      current: ["md:w-full", "after:content-['']", "after:w-full", "after:h-1", "after:border-b", "after:border-gray-200", "after:border-1", "after:hidden", "sm:after:inline-block", "after:mx-6", "xl:after:mx-10", "dark:after:border-gray-700"],
      pending: ["md:w-full", "after:content-['']", "after:w-full", "after:h-1", "after:border-b", "after:border-gray-200", "after:border-1", "after:hidden", "sm:after:inline-block", "after:mx-6", "xl:after:mx-10", "dark:after:border-gray-700"]
    },
    isLast: {
      true: "",
      false: ""
    }
  },
  compoundVariants: [
    {
      isLast: true,
      class: ["after:content-none", "after:hidden"]
    }
  ],
  defaultVariants: {
    status: "pending",
    isLast: false
  }
});
ce({
  base: "flex items-center",
  variants: {
    status: {
      completed: ["after:content-['/']", "sm:after:hidden", "after:mx-2", "after:text-gray-200", "dark:after:text-gray-500"],
      current: ["after:content-['/']", "sm:after:hidden", "after:mx-2", "after:text-gray-200", "dark:after:text-gray-500"],
      pending: ["after:content-['/']", "sm:after:hidden", "after:mx-2", "after:text-gray-200", "dark:after:text-gray-500"]
    },
    isLast: {
      true: "",
      false: ""
    }
  },
  compoundVariants: [
    {
      isLast: true,
      class: ["after:content-none"]
    }
  ],
  defaultVariants: {
    status: "pending",
    isLast: false
  }
});
ce({
  base: "flex items-center w-full"
});
ce({
  base: "flex items-center w-full",
  variants: {
    status: {
      completed: ["text-primary-600", "dark:text-primary-500", "after:content-['']", "after:w-full", "after:h-1", "after:border-b", "after:border-primary-100", "after:border-4", "after:inline-block", "dark:after:border-primary-800"],
      current: ["after:content-['']", "after:w-full", "after:h-1", "after:border-b", "after:border-gray-100", "after:border-4", "after:inline-block", "dark:after:border-gray-700"],
      pending: ["after:content-['']", "after:w-full", "after:h-1", "after:border-b", "after:border-gray-100", "after:border-4", "after:inline-block", "dark:after:border-gray-700"]
    },
    isLast: {
      true: "",
      false: ""
    }
  },
  compoundVariants: [
    {
      isLast: true,
      class: ["after:content-none"]
    }
  ],
  defaultVariants: {
    status: "pending",
    isLast: false
  }
});
ce({
  base: ["flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0"],
  variants: {
    status: {
      completed: ["bg-primary-100", "dark:bg-primary-800"],
      current: ["bg-gray-100", "dark:bg-gray-700"],
      pending: ["bg-gray-100", "dark:bg-gray-700"]
    }
  },
  defaultVariants: {
    status: "pending"
  }
});
ce({
  base: "items-center w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0 rtl:space-x-reverse"
});
ce({
  base: ["flex items-center space-x-2.5 rtl:space-x-reverse"],
  variants: {
    status: {
      completed: ["text-primary-600", "dark:text-primary-500"],
      current: ["text-gray-500", "dark:text-gray-400"],
      pending: ["text-gray-500", "dark:text-gray-400"]
    }
  },
  defaultVariants: {
    status: "pending"
  }
});
ce({
  base: ["flex items-center justify-center w-8 h-8 rounded-full shrink-0"],
  variants: {
    status: {
      completed: ["border border-primary-600 dark:border-primary-500", "bg-primary-600 dark:bg-primary-500", "text-white"],
      current: ["border border-gray-500 dark:border-gray-400", "text-gray-500 dark:text-gray-400"],
      pending: ["border border-gray-500 dark:border-gray-400", "text-gray-500 dark:text-gray-400"]
    }
  },
  defaultVariants: {
    status: "pending"
  }
});
ce({
  base: "space-y-4 w-72"
});
ce({
  base: ["w-full p-4 border rounded-lg"],
  variants: {
    status: {
      completed: ["text-green-700", "border-green-300", "bg-green-50", "dark:bg-gray-800", "dark:border-green-800", "dark:text-green-400"],
      current: ["text-primary-700", "bg-primary-100", "border-primary-300", "dark:bg-gray-800", "dark:border-primary-800", "dark:text-primary-400"],
      pending: ["text-gray-900", "bg-gray-100", "border-gray-300", "dark:bg-gray-800", "dark:border-gray-700", "dark:text-gray-400"]
    }
  },
  defaultVariants: {
    status: "pending"
  }
});
ce({
  base: "flex items-center justify-between"
});
ce({
  base: ["flex items-center w-full p-3 space-x-2 text-sm font-medium text-center", "text-gray-500 bg-white border border-gray-200 rounded-lg shadow-xs", "dark:text-gray-400 sm:text-base dark:bg-gray-800 dark:border-gray-700", "sm:p-4 sm:space-x-4 rtl:space-x-reverse"]
});
ce({
  base: ["flex items-center"],
  variants: {
    status: {
      completed: ["text-primary-600", "dark:text-primary-500"],
      current: ["text-gray-500", "dark:text-gray-400"],
      pending: ["text-gray-500", "dark:text-gray-400"]
    },
    hasChevron: {
      true: [],
      false: []
    }
  },
  defaultVariants: {
    status: "pending",
    hasChevron: false
  }
});
ce({
  base: ["flex items-center justify-center w-5 h-5 me-2 text-xs rounded-full shrink-0"],
  variants: {
    status: {
      completed: ["border border-primary-600 dark:border-primary-500", "bg-primary-600 dark:bg-primary-500", "text-white"],
      current: ["border border-gray-500 dark:border-gray-400", "text-gray-500 dark:text-gray-400"],
      pending: ["border border-gray-500 dark:border-gray-400", "text-gray-500 dark:text-gray-400"]
    }
  },
  defaultVariants: {
    status: "pending"
  }
});
ce({
  base: "relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400"
});
ce({
  base: "ms-6",
  variants: {
    isLast: {
      true: "",
      false: "mb-10"
    }
  },
  defaultVariants: {
    isLast: false
  }
});
ce({
  base: ["absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900"],
  variants: {
    status: {
      completed: ["bg-green-200", "dark:bg-green-900"],
      current: ["bg-gray-100", "dark:bg-gray-700"],
      pending: ["bg-gray-100", "dark:bg-gray-700"]
    }
  },
  defaultVariants: {
    status: "pending"
  }
});
ce({
  slots: {
    base: "flex space-x-2 rtl:space-x-reverse",
    content: "p-4 bg-gray-50 rounded-lg dark:bg-gray-800 mt-4",
    divider: "h-px bg-gray-200 dark:bg-gray-700",
    active: "p-4 text-primary-600 bg-gray-100 rounded-t-lg dark:bg-gray-800 dark:text-primary-500",
    inactive: "p-4 text-gray-500 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
  },
  variants: {
    tabStyle: {
      full: {
        active: "p-4 w-full rounded-none group-first:rounded-s-lg group-last:rounded-e-lg text-gray-900 bg-gray-100 focus:ring-4 focus:ring-primary-300 focus:outline-hidden dark:bg-gray-700 dark:text-white",
        inactive: "p-4 w-full rounded-none group-first:rounded-s-lg group-last:rounded-e-lg text-gray-500 dark:text-gray-400 bg-white hover:text-gray-700 hover:bg-gray-50 focus:ring-4 focus:ring-primary-300 focus:outline-hidden dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
      },
      pill: {
        active: "py-3 px-4 text-white bg-primary-600 rounded-lg",
        inactive: "py-3 px-4 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      },
      underline: {
        base: "-mb-px",
        active: "p-4 text-primary-600 border-b-2 border-primary-600 dark:text-primary-500 dark:border-primary-500 bg-transparent",
        inactive: "p-4 border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 text-gray-500 dark:text-gray-400 bg-transparent"
      },
      none: {
        active: "",
        inactive: ""
      }
    },
    hasDivider: {
      true: {}
    }
  },
  compoundVariants: [
    {
      tabStyle: ["full", "pill"],
      hasDivider: true,
      class: {
        divider: "hidden"
      }
    }
  ],
  defaultVariants: {
    tabStyle: "none",
    hasDivider: true
  }
});
ce({
  slots: {
    base: "group focus-within:z-10",
    button: "inline-block text-sm font-medium text-center disabled:cursor-not-allowed",
    content: "hidden"
  },
  variants: {
    open: {
      true: {
        button: "active"
      }
    },
    disabled: {
      true: {
        button: "cursor-not-allowed"
      }
    }
  },
  compoundVariants: [
    {
      open: true,
      class: {
        button: ""
        // We'll merge this with activeClasses from context
      }
    },
    {
      open: false,
      class: {
        button: ""
        // We'll merge this with inactiveClasses from context
      }
    }
  ],
  defaultVariants: {
    open: false,
    disabled: false
  }
});
ce({
  slots: {
    base: "",
    table: "w-full text-left text-sm"
  },
  variants: {
    color: {
      // default, primary, secondary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
      default: { table: "text-gray-500 dark:text-gray-400" },
      primary: { table: "text-primary-100 dark:text-primary-100" },
      secondary: { table: "text-secondary-100 dark:text-secondary-100" },
      gray: { table: "text-gray-100 dark:text-gray-100" },
      red: { table: "text-red-100 dark:text-red-100" },
      orange: { table: "text-orange-100 dark:text-orange-100" },
      amber: { table: "text-amber-100 dark:text-amber-100" },
      yellow: { table: "text-yellow-100 dark:text-yellow-100" },
      lime: { table: "text-lime-100 dark:text-lime-100" },
      green: { table: "text-green-100 dark:text-green-100" },
      emerald: { table: "text-emerald-100 dark:text-emerald-100" },
      teal: { table: "text-teal-100 dark:text-teal-100" },
      cyan: { table: "text-cyan-100 dark:text-cyan-100" },
      sky: { table: "text-sky-100 dark:text-sky-100" },
      blue: { table: "text-blue-100 dark:text-blue-100" },
      indigo: { table: "text-indigo-100 dark:text-indigo-100" },
      violet: { table: "text-violet-100 dark:text-violet-100" },
      purple: { table: "text-purple-100 dark:text-purple-100" },
      fuchsia: { table: "text-fuchsia-100 dark:text-fuchsia-100" },
      pink: { table: "text-pink-100 dark:text-pink-100" },
      rose: { table: "text-rose-100 dark:text-rose-100" }
    },
    shadow: {
      true: { base: "shadow-md sm:rounded-lg" }
    }
  }
});
ce({
  base: "",
  variants: {
    color: {
      default: "bg-white dark:bg-gray-800 dark:border-gray-700",
      primary: "bg-white bg-primary-500 border-primary-400",
      secondary: "bg-white bg-secondary-500 border-secondary-400",
      gray: "bg-gray-500 border-gray-400",
      red: "bg-red-500 border-red-400",
      orange: "bg-orange-500 border-orange-400",
      amber: "bg-amber-500 border-amber-400",
      yellow: "bg-yellow-500 border-yellow-400",
      lime: "bg-lime-500 border-lime-400",
      green: "bg-white bg-green-500 border-green-400",
      emerald: "bg-emerald-500 border-emerald-400",
      teal: "bg-teal-500 border-teal-400",
      cyan: "bg-cyan-500 border-cyan-400",
      sky: "bg-sky-500 border-sky-400",
      blue: "bg-white bg-blue-500 border-blue-400",
      indigo: "bg-indigo-500 border-indigo-400",
      violet: "bg-violet-500 border-violet-400",
      purple: "bg-purple-500 border-purple-400",
      fuchsia: "bg-fuchsia-500 border-fuchsia-400",
      pink: "bg-pink-500 border-pink-400",
      rose: "bg-rose-500 border-rose-400"
    },
    hoverable: {
      true: ""
    },
    striped: {
      true: ""
    },
    border: {
      true: "border-b last:border-b-0"
    }
  },
  compoundVariants: [
    {
      hoverable: true,
      color: "default",
      class: "hover:bg-gray-50 dark:hover:bg-gray-600"
    },
    {
      hoverable: true,
      color: "primary",
      class: "hover:bg-primary-400 dark:hover:bg-primary-400"
    },
    {
      hoverable: true,
      color: "secondary",
      class: "hover:bg-secondary-400 dark:hover:bg-secondary-400"
    },
    {
      hoverable: true,
      color: "gray",
      class: "hover:bg-gray-400 dark:hover:bg-gray-400"
    },
    {
      hoverable: true,
      color: "red",
      class: "hover:bg-red-400 dark:hover:bg-red-400"
    },
    {
      hoverable: true,
      color: "orange",
      class: "hover:bg-orange-400 dark:hover:bg-orange-400"
    },
    {
      hoverable: true,
      color: "amber",
      class: "hover:bg-amber-400 dark:hover:bg-amber-400"
    },
    {
      hoverable: true,
      color: "yellow",
      class: "hover:bg-yellow-400 dark:hover:bg-yellow-400"
    },
    {
      hoverable: true,
      color: "lime",
      class: "hover:bg-lime-400 dark:hover:bg-lime-400"
    },
    {
      hoverable: true,
      color: "green",
      class: "hover:bg-green-400 dark:hover:bg-green-400"
    },
    {
      hoverable: true,
      color: "emerald",
      class: "hover:bg-emerald-400 dark:hover:bg-emerald-400"
    },
    {
      hoverable: true,
      color: "teal",
      class: "hover:bg-teal-400 dark:hover:bg-teal-400"
    },
    {
      hoverable: true,
      color: "cyan",
      class: "hover:bg-cyan-400 dark:hover:bg-cyan-400"
    },
    {
      hoverable: true,
      color: "sky",
      class: "hover:bg-sky-400 dark:hover:bg-sky-400"
    },
    {
      hoverable: true,
      color: "blue",
      class: "hover:bg-blue-400 dark:hover:bg-blue-400"
    },
    {
      hoverable: true,
      color: "indigo",
      class: "hover:bg-indigo-400 dark:hover:bg-indigo-400"
    },
    {
      hoverable: true,
      color: "violet",
      class: "hover:bg-violet-400 dark:hover:bg-violet-400"
    },
    {
      hoverable: true,
      color: "purple",
      class: "hover:bg-purple-400 dark:hover:bg-purple-400"
    },
    {
      hoverable: true,
      color: "fuchsia",
      class: "hover:bg-fuchsia-400 dark:hover:bg-fuchsia-400"
    },
    {
      hoverable: true,
      color: "pink",
      class: "hover:bg-pink-400 dark:hover:bg-pink-400"
    },
    {
      hoverable: true,
      color: "rose",
      class: "hover:bg-rose-400 dark:hover:bg-rose-400"
    },
    {
      striped: true,
      color: "default",
      class: "odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700"
    },
    {
      striped: true,
      color: "primary",
      class: "odd:bg-primary-500 even:bg-primary-600 dark:odd:bg-primary-500 dark:even:bg-primary-600"
    },
    {
      striped: true,
      color: "secondary",
      class: "odd:bg-secondary-500 even:bg-secondary-600 dark:odd:bg-secondary-500 dark:even:bg-secondary-600"
    },
    {
      striped: true,
      color: "gray",
      class: "odd:bg-gray-500 even:bg-gray-600 dark:odd:bg-gray-500 dark:even:bg-gray-600"
    },
    // default, primary, secondary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
    {
      striped: true,
      color: "red",
      class: "odd:bg-red-500 even:bg-red-600 dark:odd:bg-red-500 dark:even:bg-red-600"
    },
    {
      striped: true,
      color: "orange",
      class: "odd:bg-orange-500 even:bg-orange-600 dark:odd:bg-orange-500 dark:even:bg-orange-600"
    },
    {
      striped: true,
      color: "amber",
      class: "odd:bg-amber-500 even:bg-amber-600 dark:odd:bg-amber-500 dark:even:bg-amber-600"
    },
    {
      striped: true,
      color: "yellow",
      class: "odd:bg-yellow-500 even:bg-yellow-600 dark:odd:bg-yellow-500 dark:even:bg-yellow-600"
    },
    {
      striped: true,
      color: "lime",
      class: "odd:bg-lime-500 even:bg-lime-600 dark:odd:bg-lime-500 dark:even:bg-lime-600"
    },
    {
      striped: true,
      color: "green",
      class: "odd:bg-green-500 even:bg-green-600 dark:odd:bg-green-500 dark:even:bg-green-600"
    },
    {
      striped: true,
      color: "emerald",
      class: "odd:bg-emerald-500 even:bg-emerald-600 dark:odd:bg-emerald-500 dark:even:bg-emerald-600"
    },
    {
      striped: true,
      color: "teal",
      class: "odd:bg-teal-500 even:bg-teal-600 dark:odd:bg-teal-500 dark:even:bg-teal-600"
    },
    {
      striped: true,
      color: "cyan",
      class: "odd:bg-cyan-500 even:bg-cyan-600 dark:odd:bg-cyan-500 dark:even:bg-cyan-600"
    },
    {
      striped: true,
      color: "sky",
      class: "odd:bg-sky-500 even:bg-sky-600 dark:odd:bg-sky-500 dark:even:bg-sky-600"
    },
    {
      striped: true,
      color: "blue",
      class: "odd:bg-blue-500 even:bg-blue-600 dark:odd:bg-blue-500 dark:even:bg-blue-600"
    },
    {
      striped: true,
      color: "indigo",
      class: "odd:bg-indigo-500 even:bg-indigo-600 dark:odd:bg-indigo-500 dark:even:bg-indigo-600"
    },
    {
      striped: true,
      color: "violet",
      class: "odd:bg-violet-500 even:bg-violet-600 dark:odd:bg-violet-500 dark:even:bg-violet-600"
    },
    {
      striped: true,
      color: "purple",
      class: "odd:bg-purple-500 even:bg-purple-600 dark:odd:bg-purple-500 dark:even:bg-purple-600"
    },
    {
      striped: true,
      color: "fuchsia",
      class: "odd:bg-fuchsia-500 even:bg-fuchsia-600 dark:odd:bg-fuchsia-500 dark:even:bg-fuchsia-600"
    },
    {
      striped: true,
      color: "pink",
      class: "odd:bg-pink-500 even:bg-pink-600 dark:odd:bg-pink-500 dark:even:bg-pink-600"
    },
    {
      striped: true,
      color: "rose",
      class: "odd:bg-rose-500 even:bg-rose-600 dark:odd:bg-rose-500 dark:even:bg-rose-600"
    }
  ]
});
ce({
  base: "text-xs uppercase",
  variants: {
    color: {
      // default, primary, secondary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
      default: "text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-700",
      primary: "text-white dark:text-white bg-primary-700 dark:bg-primary-700",
      secondary: "text-white dark:text-white bg-secondary-700 dark:bg-secondary-700",
      gray: "text-white dark:text-white bg-gray-700 dark:bg-gray-700",
      red: "text-white dark:text-white bg-red-700 dark:bg-red-700",
      orange: "text-white dark:text-white bg-orange-700 dark:bg-orange-700",
      amber: "text-white dark:text-white bg-amber-700 dark:bg-amber-700",
      yellow: "text-white dark:text-white bg-yellow-700 dark:bg-yellow-700",
      lime: "text-white dark:text-white bg-lime-700 dark:bg-lime-700",
      green: "text-white dark:text-white bg-green-700 dark:bg-green-700",
      emerald: "text-white dark:text-white bg-emerald-700 dark:bg-emerald-700",
      teal: "text-white dark:text-white bg-teal-700 dark:bg-teal-700",
      cyan: "text-white dark:text-white bg-cyan-700 dark:bg-cyan-700",
      sky: "text-white dark:text-white bg-sky-700 dark:bg-sky-700",
      blue: "text-white dark:text-white bg-blue-700 dark:bg-blue-700",
      indigo: "text-white dark:text-white bg-indigo-700 dark:bg-indigo-700",
      violet: "text-white dark:text-white bg-violet-700 dark:bg-violet-700",
      purple: "text-white dark:text-white bg-purple-700 dark:bg-purple-700",
      fuchsia: "text-white dark:text-white bg-fuchsia-700 dark:bg-fuchsia-700",
      pink: "text-white dark:text-white bg-pink-700 dark:bg-pink-700",
      rose: "text-white dark:text-white bg-rose-700 dark:bg-rose-700"
    },
    border: {
      true: "",
      false: ""
    },
    striped: {
      true: "",
      false: ""
    }
  },
  compoundVariants: [
    {
      color: "default",
      border: true,
      class: ""
      //"bg-transparent dark:bg-transparent"
    },
    {
      color: "default",
      striped: true,
      class: ""
      //"bg-transparent dark:bg-transparent border-gray-700"
    },
    {
      striped: true,
      color: "blue",
      class: "border-blue-400"
    },
    {
      striped: true,
      color: "green",
      class: "border-green-400"
    },
    {
      striped: true,
      color: "red",
      class: "border-red-400"
    },
    {
      striped: true,
      color: "yellow",
      class: "border-yellow-400"
    },
    {
      striped: true,
      color: "purple",
      class: "border-purple-400"
    },
    {
      striped: true,
      color: "indigo",
      class: "border-indigo-400"
    },
    {
      striped: true,
      color: "pink",
      class: "border-pink-400"
    }
  ]
});
ce({
  base: "px-6 py-4 whitespace-nowrap font-medium"
});
ce({
  base: "px-6 py-3"
});
ce({
  base: "relative border-s border-gray-200 dark:border-gray-700"
});
ce({
  slots: {
    li: "mb-10 ms-6",
    span: "flex absolute -start-3 justify-center items-center w-6 h-6 bg-blue-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900",
    img: "rounded-full shadow-lg",
    outerDiv: "p-4 bg-white rounded-lg border border-gray-200 shadow-xs dark:bg-gray-700 dark:border-gray-600",
    innerDiv: "justify-between items-center mb-3 sm:flex",
    time: "mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0",
    title: "text-sm font-normal text-gray-500 lex dark:text-gray-300",
    text: "p-3 text-xs italic font-normal text-gray-500 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
  }
});
ce({
  slots: {
    div: "p-5 mb-4 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700",
    time: "text-lg font-semibold text-gray-900 dark:text-white",
    ol: "mt-3 divide-y divider-gray-200 dark:divide-gray-700"
  }
});
ce({
  slots: {
    a: "block items-center p-3 sm:flex hover:bg-gray-100 dark:hover:bg-gray-700",
    img: "me-3 mb-3 w-12 h-12 rounded-full sm:mb-0",
    div: "text-gray-600 dark:text-gray-400",
    title: "text-base font-normal",
    span: "inline-flex items-center text-xs font-normal text-gray-500 dark:text-gray-400"
  }
});
ce({
  variants: {
    order: {
      group: "p-5 mb-4 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700",
      horizontal: "sm:flex",
      activity: "relative border-s border-gray-200 dark:border-gray-700",
      vertical: "relative border-s border-gray-200 dark:border-gray-700",
      default: "relative border-s border-gray-200 dark:border-gray-700"
    }
  },
  defaultVariants: {
    order: "default"
  }
});
ce({
  slots: {
    li: "",
    div: "",
    time: "",
    h3: "",
    svg: "w-3 h-3 text-primary-600 dark:text-primary-400"
  },
  variants: {
    order: {
      default: {
        li: "mb-10 ms-4",
        div: "absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700",
        time: "mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500",
        h3: "text-lg font-semibold text-gray-900 dark:text-white"
      },
      vertical: {
        li: "mb-10 ms-6",
        div: "flex absolute -start-3 justify-center items-center w-6 h-6 bg-primary-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-primary-900",
        time: "mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500",
        h3: "flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white"
      },
      horizontal: {
        li: "relative mb-6 sm:mb-0",
        div: "flex items-center",
        time: "mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500",
        h3: "text-lg font-semibold text-gray-900 dark:text-white"
      },
      activity: {
        li: "mb-10 ms-6",
        div: "flex absolute -start-3 justify-center items-center w-6 h-6 bg-primary-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-primary-900",
        time: "mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500",
        h3: "text-lg font-semibold text-gray-900 dark:text-white"
      },
      group: {
        li: "",
        div: "p-5 mb-4 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700",
        time: "text-lg font-semibold text-gray-900 dark:text-white",
        h3: "text-lg font-semibold text-gray-900 dark:text-white"
      }
    }
  },
  defaultVariants: {
    order: "default"
  }
});
ce({
  slots: {
    base: "flex w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800 gap-3",
    icon: "w-8 h-8 inline-flex items-center justify-center shrink-0 rounded-lg",
    content: "w-full text-sm font-normal",
    close: "ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
  },
  variants: {
    position: {
      "top-left": { base: "absolute top-5 start-5" },
      "top-right": { base: "absolute top-5 end-5" },
      "bottom-left": { base: "absolute bottom-5 start-5" },
      "bottom-right": { base: "absolute bottom-5 end-5" }
    },
    color: {
      // primary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
      primary: {
        icon: "text-primary-500 bg-primary-100 dark:bg-primary-800 dark:text-primary-200",
        close: "text-primary-500 dark:text-primary-200 hover:text-primary-600 dark:hover:text-primary-500"
      },
      gray: {
        icon: "text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-200",
        close: "text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-500"
      },
      red: {
        icon: "text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200",
        close: "text-red-500 dark:text-red-200 hover:text-red-600 dark:hover:text-red-500"
      },
      orange: {
        icon: "text-orange-500 bg-orange-100 dark:bg-orange-700 dark:text-orange-200",
        close: "text-orange-500 dark:text-orange-200 hover:text-orange-600 dark:hover:text-orange-500"
      },
      amber: {
        icon: "text-amber-500 bg-amber-100 dark:bg-amber-700 dark:text-amber-200",
        close: "text-amber-500 dark:text-amber-200 hover:text-amber-600 dark:hover:text-amber-500"
      },
      yellow: {
        icon: "text-yellow-500 bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-200",
        close: "text-yellow-500 dark:text-yellow-200 hover:text-yellow-600 dark:hover:text-yellow-500"
      },
      lime: {
        icon: "text-lime-500 bg-lime-100 dark:bg-lime-700 dark:text-lime-200",
        close: "text-lime-500 dark:text-lime-200 hover:text-lime-600 dark:hover:text-lime-500"
      },
      green: {
        icon: "text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200",
        close: "text-green-500 dark:text-green-200 hover:text-green-600 dark:hover:text-green-500"
      },
      emerald: {
        icon: "text-emerald-500 bg-emerald-100 dark:bg-emerald-800 dark:text-emerald-200",
        close: "text-emerald-500 dark:text-emerald-200 hover:text-emerald-600 dark:hover:text-emerald-500"
      },
      teal: {
        icon: "text-teal-500 bg-teal-100 dark:bg-teal-800 dark:text-teal-200",
        close: "text-teal-500 dark:text-teal-200 hover:text-teal-600 dark:hover:text-teal-500"
      },
      cyan: {
        icon: "text-cyan-500 bg-cyan-100 dark:bg-cyan-800 dark:text-cyan-200",
        close: "text-cyan-500 dark:text-cyan-200 hover:text-cyan-600 dark:hover:text-cyan-500"
      },
      sky: {
        icon: "text-sky-500 bg-sky-100 dark:bg-sky-800 dark:text-sky-200",
        close: "text-sky-500 dark:text-sky-200 hover:text-sky-600 dark:hover:text-sky-500"
      },
      blue: {
        icon: "text-blue-500 bg-blue-100 dark:bg-blue-800 dark:text-blue-200",
        close: "text-blue-500 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-500"
      },
      indigo: {
        icon: "text-indigo-500 bg-indigo-100 dark:bg-indigo-800 dark:text-indigo-200",
        close: "text-indigo-500 dark:text-indigo-200 hover:text-indigo-600 dark:hover:text-indigo-500"
      },
      violet: {
        icon: "text-violet-500 bg-violet-100 dark:bg-violet-800 dark:text-violet-200",
        close: "text-violet-500 dark:text-violet-200 hover:text-violet-600 dark:hover:text-violet-500"
      },
      purple: {
        icon: "text-purple-500 bg-purple-100 dark:bg-purple-800 dark:text-purple-200",
        close: "text-purple-500 dark:text-purple-200 hover:text-purple-600 dark:hover:text-purple-500"
      },
      fuchsia: {
        icon: "text-fuchsia-500 bg-fuchsia-100 dark:bg-fuchsia-800 dark:text-fuchsia-200",
        close: "text-fuchsia-500 dark:text-fuchsia-200 hover:text-fuchsia-600 dark:hover:text-fuchsia-500"
      },
      pink: {
        icon: "text-pink-500 bg-pink-100 dark:bg-pink-700 dark:text-pink-200",
        close: "text-pink-500 dark:text-pink-200 hover:text-pink-600 dark:hover:text-pink-500"
      },
      rose: {
        icon: "text-rose-500 bg-rose-100 dark:bg-rose-700 dark:text-rose-200",
        close: "text-rose-500 dark:text-rose-200 hover:text-rose-600 dark:hover:text-rose-500"
      }
    },
    align: {
      true: { base: "items-center" },
      false: { base: "items-start" }
    }
  }
});
ce({
  base: "focus:outline-hidden whitespace-normal",
  variants: {
    // primary, secondary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
    color: {
      primary: "text-primary-500 focus:ring-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 dark:hover:text-primary-300",
      secondary: "text-secondary-500 focus:ring-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-800 dark:hover:text-secondary-300",
      gray: "text-gray-500 focus:ring-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-300",
      red: "text-red-500 focus:ring-red-400 hover:bg-red-200 dark:hover:bg-red-800 dark:hover:text-red-300",
      orange: "text-orange-500 focus:ring-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800 dark:hover:text-orange-300",
      amber: "text-amber-500 focus:ring-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800 dark:hover:text-amber-300",
      yellow: "text-yellow-500 focus:ring-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-800 dark:hover:text-yellow-300",
      lime: "text-lime-500 focus:ring-lime-400 hover:bg-lime-200 dark:hover:bg-lime-800 dark:hover:text-lime-300",
      green: "text-green-500 focus:ring-green-400 hover:bg-green-200 dark:hover:bg-green-800 dark:hover:text-green-300",
      emerald: "text-emerald-500 focus:ring-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800 dark:hover:text-emerald-300",
      teal: "text-teal-500 focus:ring-teal-400 hover:bg-teal-200 dark:hover:bg-teal-800 dark:hover:text-teal-300",
      cyan: "text-cyan-500 focus:ring-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-800 dark:hover:text-cyan-300",
      sky: "text-sky-500 focus:ring-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800 dark:hover:text-sky-300",
      blue: "text-blue-500 focus:ring-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 dark:hover:text-blue-300",
      indigo: "text-indigo-500 focus:ring-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 dark:hover:text-indigo-300",
      violet: "text-violet-500 focus:ring-violet-400 hover:bg-violet-200 dark:hover:bg-violet-800 dark:hover:text-violet-300",
      purple: "text-purple-500 focus:ring-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800 dark:hover:text-purple-300",
      fuchsia: "text-fuchsia-500 focus:ring-fuchsia-400 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-800 dark:hover:text-fuchsia-300",
      pink: "text-pink-500 focus:ring-pink-400 hover:bg-pink-200 dark:hover:bg-pink-800 dark:hover:text-pink-300",
      rose: "text-rose-500 focus:ring-rose-400 hover:bg-rose-200 dark:hover:bg-rose-800 dark:hover:text-rose-300",
      none: ""
    },
    size: {
      xs: "m-0.5 rounded-xs focus:ring-1 p-0.5",
      sm: "m-0.5 rounded-sm focus:ring-1 p-0.5",
      md: "m-0.5 rounded-lg focus:ring-2 p-1.5",
      lg: "m-0.5 rounded-lg focus:ring-2 p-2.5"
    }
  },
  defaultVariants: {
    color: "gray",
    size: "md",
    href: null
  },
  slots: {
    svg: ""
  },
  compoundVariants: [
    {
      size: "xs",
      class: {
        svg: "w-3 h-3"
      }
    },
    {
      size: "sm",
      class: {
        svg: "w-3.5 h-3.5"
      }
    },
    {
      size: ["md", "lg"],
      class: {
        svg: "w-5 h-5"
      }
    },
    {
      size: ["xs", "sm", "md", "lg"],
      color: "none",
      class: "focus:ring-0 rounded-none m-0"
    }
  ]
});
ce({
  base: "inline-flex border border-gray-300 overflow-hidden",
  variants: {
    roundedSize: {
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full"
    }
  }
});
ce({
  base: "relative flex items-center transition-all duration-200  focus:outline-none border-r last:border-r-0 dark:bg-white dark:text-gray-800",
  variants: {
    selected: {
      true: "",
      false: ""
    },
    size: {
      sm: "p-1 px-2 text-sm",
      md: "p-2 px-4 text-base",
      lg: "p-3 px-5 text-lg",
      xl: "p-4 px-6 text-xl"
    },
    roundedSize: {
      sm: "first:rounded-s-sm last:rounded-e-sm",
      md: "first:rounded-s-md last:rounded-e-md",
      lg: "first:rounded-s-lg last:rounded-e-lg",
      xl: "first:rounded-s-xl last:rounded-e-xl",
      full: "first:rounded-s-full last:rounded-e-full"
    },
    color: {
      primary: "data-[selected=true]:bg-primary-200 data-[selected=false]:hover:bg-gray-100",
      secondary: "data-[selected=true]:bg-secondary-200 data-[selected=false]:hover:bg-gray-100",
      gray: "data-[selected=true]:bg-gray-200 data-[selected=false]:hover:bg-gray-100",
      red: "data-[selected=true]:bg-red-200 data-[selected=false]:hover:bg-red-50",
      orange: "data-[selected=true]:bg-orange-200 data-[selected=false]:hover:bg-orange-50",
      amber: "data-[selected=true]:bg-amber-200 data-[selected=false]:hover:bg-amber-50",
      yellow: "data-[selected=true]:bg-yellow-200 data-[selected=false]:hover:bg-yellow-50",
      lime: "data-[selected=true]:bg-lime-200 data-[selected=false]:hover:bg-lime-50",
      green: "data-[selected=true]:bg-green-200 data-[selected=false]:hover:bg-green-50",
      emerald: "data-[selected=true]:bg-emerald-200 data-[selected=false]:hover:bg-emerald-50",
      teal: "data-[selected=true]:bg-teal-200 data-[selected=false]:hover:bg-teal-50",
      cyan: "data-[selected=true]:bg-cyan-200 data-[selected=false]:hover:bg-cyan-50",
      sky: "data-[selected=true]:bg-sky-200 data-[selected=false]:hover:bg-sky-50",
      blue: "data-[selected=true]:bg-blue-200 data-[selected=false]:hover:bg-blue-50",
      indigo: "data-[selected=true]:bg-indigo-200 data-[selected=false]:hover:bg-indigo-50",
      violet: "data-[selected=true]:bg-violet-200 data-[selected=false]:hover:bg-violet-50",
      purple: "data-[selected=true]:bg-purple-200 data-[selected=false]:hover:bg-purple-50",
      fuchsia: "data-[selected=true]:bg-fuchsia-200 data-[selected=false]:hover:bg-fuchsia-50",
      pink: "data-[selected=true]:bg-pink-200 data-[selected=false]:hover:bg-pink-50",
      rose: "data-[selected=true]:bg-rose-200 data-[selected=false]:hover:bg-rose-50",
      none: ""
    }
  },
  defaultVariants: {
    selected: false,
    color: "primary",
    size: "md",
    roundedSize: "md"
  }
});
ce({
  base: "flex items-center w-full overflow-hidden relative"
});
ce({
  base: "transition-all duration-200 ml-0",
  variants: {
    selected: {
      true: "ml-5",
      false: ""
    }
  },
  defaultVariants: {
    selected: false
  }
});
ce({
  slots: {
    base: "w-4 h-4 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 focus:ring-2 me-2 rounded-sm",
    div: "flex items-center"
  },
  variants: {
    color: {
      // primary, secondary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
      primary: {
        base: "text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600"
      },
      secondary: {
        base: "text-secondary-600 focus:ring-secondary-500 dark:focus:ring-secondary-600"
      },
      gray: {
        base: "text-gray-600 focus:ring-gray-600 dark:ring-offset-gray-800 dark:focus:ring-gray-600"
      },
      red: {
        base: "text-red-600 focus:ring-red-600 dark:ring-offset-red-600 dark:focus:ring-red-600"
      },
      orange: {
        base: "text-orange-600 focus:ring-orange-600 dark:ring-offset-orange-600 dark:focus:ring-orange-600"
      },
      amber: {
        base: "text-amber-600 focus:ring-amber-600 dark:ring-offset-amber-600 dark:focus:ring-amber-600"
      },
      yellow: {
        base: "text-yellow-400 focus:ring-yellow-400 dark:ring-offset-yellow-400 dark:focus:ring-yellow-400"
      },
      lime: {
        base: "text-lime-700 focus:ring-lime-700 dark:ring-offset-lime-700 dark:focus:ring-lime-700"
      },
      green: {
        base: "text-green-600 focus:ring-green-600 dark:ring-offset-green-600 dark:focus:ring-green-600"
      },
      emerald: {
        base: "text-emerald-600 focus:ring-emerald-600 dark:ring-offset-emerald-600 dark:focus:ring-emerald-600"
      },
      teal: {
        base: "text-teal-600 focus:ring-teal-600 dark:ring-offset-teal-600 dark:focus:ring-teal-600"
      },
      cyan: {
        base: "text-cyan-600 focus:ring-cyan-600 dark:ring-offset-cyan-600 dark:focus:ring-cyan-600"
      },
      sky: {
        base: "text-sky-600 focus:ring-sky-600 dark:ring-offset-sky-600 dark:focus:ring-sky-600"
      },
      blue: {
        base: "text-blue-700 focus:ring-blue-600 dark:ring-offset-blue-700 dark:focus:ring-blue-700"
      },
      indigo: {
        base: "text-indigo-700 focus:ring-indigo-700 dark:ring-offset-indigo-700 dark:focus:ring-indigo-700"
      },
      violet: {
        base: "text-violet-600 focus:ring-violet-600 dark:ring-offset-violet-600 dark:focus:ring-violet-600"
      },
      purple: {
        base: "text-purple-600 focus:ring-purple-600 dark:ring-offset-purple-600 dark:focus:ring-purple-600"
      },
      fuchsia: {
        base: "text-fuchsia-600 focus:ring-fuchsia-600 dark:ring-offset-fuchsia-600 dark:focus:ring-fuchsia-600"
      },
      pink: {
        base: "text-pink-600 focus:ring-pink-600 dark:ring-offset-pink-600 dark:focus:ring-pink-600"
      },
      rose: {
        base: "text-rose-600 focus:ring-rose-600 dark:ring-offset-rose-600 dark:focus:ring-rose-600"
      }
    },
    tinted: {
      true: { base: "dark:bg-gray-600 dark:border-gray-500" },
      false: { base: "dark:bg-gray-700 dark:border-gray-600" }
    },
    custom: {
      true: { base: "sr-only peer" }
    },
    rounded: {
      true: { base: "rounded-sm" }
    },
    inline: {
      true: {
        div: "inline-flex",
        false: "flex items-center"
      }
    },
    disabled: {
      true: {
        base: "cursor-not-allowed opacity-50 bg-gray-200 border-gray-300",
        div: "cursor-not-allowed opacity-70"
      }
    }
  },
  defaultVariants: {
    color: "primary",
    disabled: false
  }
});
ce({
  base: "",
  variants: {
    inline: {
      true: "inline-flex",
      false: "flex"
    },
    checked: {
      true: "outline-4 outline-green-500"
    }
  },
  defaultVariants: {
    inline: true
  }
});
ce({
  base: "flex flex-col justify-center items-center w-full h-64 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
});
ce({
  slots: {
    base: "block w-full disabled:cursor-not-allowed disabled:opacity-50 rtl:text-right p-2.5 focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-500 dark:focus:ring-primary-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 text-sm rounded-lg border p-0! dark:text-gray-400",
    wrapper: "relative w-full",
    right: "flex absolute inset-y-0 items-center text-gray-500 dark:text-gray-400 end-0 p-2.5"
  },
  variants: {
    size: {
      sm: { base: "text-xs ps-9 pe-9 p-2" },
      md: { base: "text-sm ps-10 pe-10 p-2.5" },
      lg: { base: "sm:text-base ps-11 pe-11 p-3" }
    }
  }
});
ce({
  slots: {
    base: "relative",
    input: "block w-full text-sm text-gray-900 bg-transparent appearance-none dark:text-white focus:outline-hidden focus:ring-0 peer",
    label: "absolute text-sm duration-300 transform scale-75 z-10 origin-left rtl:origin-right peer-placeholder-shown:scale-100 peer-focus:scale-75",
    clearbtn: "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black",
    combo: "absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
  },
  variants: {
    variant: {
      filled: {
        base: "relative",
        input: "rounded-t-lg border-0 border-b-2 bg-gray-50 dark:bg-gray-700",
        label: "-translate-y-4 start-2.5 peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-4"
      },
      outlined: {
        base: "relative",
        input: "rounded-lg border",
        label: "-translate-y-4 bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:-translate-y-4 start-1"
      },
      standard: {
        base: "relative z-0",
        input: "border-0 border-b-2",
        label: "-translate-y-6 -z-10 peer-focus:start-0 peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-6"
      }
    },
    size: {
      small: {},
      default: {}
    },
    color: {
      default: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-primary-500 focus:border-primary-600",
        label: "text-gray-500 dark:text-gray-400 peer-focus:text-primary-600 dark:peer-focus:text-primary-500"
      },
      primary: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-primary-500 focus:border-primary-600",
        label: "text-primary-500 dark:text-primary-400 peer-focus:text-primary-600 dark:peer-focus:text-primary-500"
      },
      secondary: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-secondary-500 focus:border-secondary-600",
        label: "text-secondary-500 dark:text-secondary-400 peer-focus:text-secondary-600 dark:peer-focus:text-secondary-500"
      },
      gray: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-gray-500 focus:border-gray-600",
        label: "text-gray-500 dark:text-gray-400 peer-focus:text-gray-600 dark:peer-focus:text-gray-500"
      },
      red: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-red-500 focus:border-red-600",
        label: "text-red-500 dark:text-red-400 peer-focus:text-red-600 dark:peer-focus:text-red-500"
      },
      orange: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-orange-500 focus:border-orange-600",
        label: "text-orange-500 dark:text-orange-400 peer-focus:text-orange-600 dark:peer-focus:text-orange-500"
      },
      amber: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-amber-500 focus:border-amber-600",
        label: "text-amber-500 dark:text-amber-400 peer-focus:text-amber-600 dark:peer-focus:text-amber-500"
      },
      yellow: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-yellow-500 focus:border-yellow-600",
        label: "text-yellow-500 dark:text-yellow-400 peer-focus:text-yellow-600 dark:peer-focus:text-yellow-500"
      },
      lime: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-lime-500 focus:border-lime-600",
        label: "text-lime-500 dark:text-lime-400 peer-focus:text-lime-600 dark:peer-focus:text-lime-500"
      },
      green: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-green-500 focus:border-green-600",
        label: "text-green-500 dark:text-green-400 peer-focus:text-green-600 dark:peer-focus:text-green-500"
      },
      emerald: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-emerald-500 focus:border-emerald-600",
        label: "text-emerald-500 dark:text-emerald-400 peer-focus:text-emerald-600 dark:peer-focus:text-emerald-500"
      },
      teal: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-teal-500 focus:border-teal-600",
        label: "text-teal-500 dark:text-teal-400 peer-focus:text-teal-600 dark:peer-focus:text-teal-500"
      },
      cyan: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-cyan-500 focus:border-cyan-600",
        label: "text-cyan-500 dark:text-cyan-400 peer-focus:text-cyan-600 dark:peer-focus:text-cyan-500"
      },
      sky: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-sky-500 focus:border-sky-600",
        label: "text-sky-500 dark:text-sky-400 peer-focus:text-sky-600 dark:peer-focus:text-sky-500"
      },
      blue: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-blue-500 focus:border-blue-600",
        label: "text-blue-500 dark:text-blue-400 peer-focus:text-blue-600 dark:peer-focus:text-blue-500"
      },
      indigo: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-indigo-500 focus:border-indigo-600",
        label: "text-indigo-500 dark:text-indigo-400 peer-focus:text-indigo-600 dark:peer-focus:text-indigo-500"
      },
      violet: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-violet-500 focus:border-violet-600",
        label: "text-violet-600 dark:text-violet-500 peer-focus:text-violet-600 dark:peer-focus:text-violet-500"
      },
      purple: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-purple-500 focus:border-purple-600",
        label: "text-purple-600 dark:text-purple-500 peer-focus:text-purple-600 dark:peer-focus:text-purple-500"
      },
      fuchsia: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-fuchsia-500 focus:border-fuchsia-600",
        label: "text-fuchsia-600 dark:text-fuchsia-500 peer-focus:text-fuchsia-600 dark:peer-focus:text-fuchsia-500"
      },
      pink: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-pink-500 focus:border-pink-600",
        label: "text-pink-600 dark:text-pink-500 peer-focus:text-pink-600 dark:peer-focus:text-pink-500"
      },
      rose: {
        input: "border-gray-300 dark:border-gray-600 dark:focus:border-rose-500 focus:border-rose-600",
        label: "text-rose-600 dark:text-rose-500 peer-focus:text-rose-600 dark:peer-focus:text-rose-500"
      }
    }
  },
  compoundVariants: [
    {
      variant: "filled",
      size: "small",
      class: {
        input: "px-2.5 pb-1.5 pt-4",
        label: "top-3"
      }
    },
    {
      variant: "filled",
      size: "default",
      class: {
        input: "px-2.5 pb-2.5 pt-5",
        label: "top-4"
      }
    },
    {
      variant: "outlined",
      size: "small",
      class: {
        input: "px-2.5 pb-1.5 pt-3",
        label: "top-1"
      }
    },
    {
      variant: "outlined",
      size: "default",
      class: {
        input: "px-2.5 pb-2.5 pt-4",
        label: "top-2"
      }
    },
    {
      variant: "standard",
      size: "small",
      class: {
        input: "py-2 px-0",
        label: "top-3"
      }
    },
    {
      variant: "standard",
      size: "default",
      class: {
        input: "py-2.5 px-0",
        label: "top-3"
      }
    },
    {
      variant: "filled",
      color: "primary",
      class: {
        input: "dark:focus:border-primary-500 focus:border-primary-600"
      }
    }
  ],
  defaultVariants: {
    variant: "standard",
    size: "default",
    color: "primary"
  }
});
ce({
  base: "text-xs font-normal text-gray-500 dark:text-gray-300",
  variants: {
    color: {
      disabled: "text-gray-400 dark:text-gray-500",
      primary: "text-primary-500 dark:text-primary-400",
      secondary: "text-secondary-500 dark:text-secondary-400",
      green: "text-green-500 dark:text-green-400",
      emerald: "text-emerald-500 dark:text-emerald-400",
      red: "text-red-500 dark:text-red-400",
      blue: "text-blue-500 dark:text-blue-400",
      yellow: "text-yellow-500 dark:text-yellow-400",
      orange: "text-orange-500 dark:text-orange-400",
      gray: "text-gray-500 dark:text-gray-400",
      teal: "text-teal-500 dark:text-teal-400",
      cyan: "text-cyan-500 dark:text-cyan-400",
      sky: "text-sky-500 dark:text-sky-400",
      indigo: "text-indigo-500 dark:text-indigo-400",
      lime: "text-lime-500 dark:text-lime-400",
      amber: "text-amber-500 dark:text-amber-400",
      violet: "text-violet-500 dark:text-violet-400",
      purple: "text-purple-500 dark:text-purple-400",
      fuchsia: "text-fuchsia-500 dark:text-fuchsia-400",
      pink: "text-pink-500 dark:text-pink-400",
      rose: "text-rose-500 dark:text-rose-400"
    }
  }
});
ce({
  slots: {
    base: "relative w-full",
    input: "block w-full disabled:cursor-not-allowed disabled:opacity-50 rtl:text-right focus:outline-hidden",
    left: "flex absolute inset-y-0 items-center text-gray-500 dark:text-gray-400 pointer-events-none start-0 p-2.5",
    right: "flex absolute inset-y-0 items-center text-gray-500 dark:text-gray-400 end-0 p-2.5",
    clearbtn: "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black",
    combo: "absolute top-full right-0 left-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800",
    comboItem: "text-gray-900 dark:text-gray-50"
  },
  variants: {
    size: {
      sm: { input: "text-xs px-2 py-1" },
      md: { input: "text-sm px-2.5 py-2.5" },
      lg: { input: "sm:text-base px-3 py-3" }
    },
    color: {
      default: {
        input: "border border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-500 dark:focus:ring-primary-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
      },
      tinted: {
        input: "border border-gray-300 dark:border-gray-500 bg-gray-50 text-gray-900 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
      },
      primary: {
        input: "border border-primary-200 dark:border-primary-400 focus:ring-primary-500 focus:border-primary-600 dark:focus:ring-primary-500 dark:focus:border-primary-500 bg-primary-50 text-primary-900 placeholder-primary-700 dark:text-primary-400 dark:placeholder-primary-500 dark:bg-gray-700"
      },
      secondary: {
        input: "border border-secondary-200 dark:border-secondary-400 focus:ring-secondary-500 focus:border-secondary-600 dark:focus:ring-secondary-500 dark:focus:border-secondary-500 bg-secondary-50 text-secondary-900 placeholder-secondary-700 dark:text-secondary-400 dark:placeholder-secondary-500 dark:bg-gray-700"
      },
      green: {
        input: "border border-green-200 dark:border-green-400 focus:ring-green-500 focus:border-green-600 dark:focus:ring-green-500 dark:focus:border-green-500 bg-green-50 text-green-900 placeholder-green-700 dark:text-green-400 dark:placeholder-green-500 dark:bg-gray-700"
      },
      emerald: {
        input: "border border-emerald-200 dark:border-emerald-400 focus:ring-emerald-500 focus:border-emerald-600 dark:focus:ring-emerald-500 dark:focus:border-emerald-500 bg-emerald-50 text-emerald-900 placeholder-emerald-700 dark:text-emerald-400 dark:placeholder-emerald-500 dark:bg-gray-700"
      },
      red: {
        input: "border border-red-200 dark:border-red-400 focus:ring-red-500 focus:border-red-600 dark:focus:ring-red-500 dark:focus:border-red-500 bg-red-50 text-red-900 placeholder-red-700 dark:text-red-400 dark:placeholder-red-500 dark:bg-gray-700"
      },
      blue: {
        input: "border border-blue-200 dark:border-blue-400 focus:ring-blue-500 focus:border-blue-600 dark:focus:ring-blue-500 dark:focus:border-blue-500 bg-blue-50 text-blue-900 placeholder-blue-700 dark:text-blue-400 dark:placeholder-blue-500 dark:bg-gray-700"
      },
      yellow: {
        input: "border border-yellow-200 dark:border-yellow-400 focus:ring-yellow-500 focus:border-yellow-600 dark:focus:ring-yellow-500 dark:focus:border-yellow-500 bg-yellow-50 text-yellow-900 placeholder-yellow-700 dark:text-yellow-400 dark:placeholder-yellow-500 dark:bg-gray-700"
      },
      orange: {
        input: "border border-orange-200 dark:border-orange-400 focus:ring-orange-500 focus:border-orange-600 dark:focus:ring-orange-500 dark:focus:border-orange-500 bg-orange-50 text-orange-900 placeholder-orange-700 dark:text-orange-400 dark:placeholder-orange-500 dark:bg-gray-700"
      },
      gray: {
        input: "border border-gray-200 dark:border-gray-400 focus:ring-gray-500 focus:border-gray-600 dark:focus:ring-gray-500 dark:focus:border-gray-500 bg-gray-50 text-gray-900 placeholder-gray-700 dark:text-gray-400 dark:placeholder-gray-500 dark:bg-gray-700"
      },
      teal: {
        input: "border border-teal-200 dark:border-teal-400 focus:ring-teal-500 focus:border-teal-600 dark:focus:ring-teal-500 dark:focus:border-teal-500 bg-teal-50 text-teal-900 placeholder-teal-700 dark:text-teal-400 dark:placeholder-teal-500 dark:bg-gray-700"
      },
      cyan: {
        input: "border border-cyan-200 dark:border-cyan-400 focus:ring-cyan-500 focus:border-cyan-600 dark:focus:ring-cyan-500 dark:focus:border-cyan-500 bg-cyan-50 text-cyan-900 placeholder-cyan-700 dark:text-cyan-400 dark:placeholder-cyan-500 dark:bg-gray-700"
      },
      sky: {
        input: "border border-sky-200 dark:border-sky-400 focus:ring-sky-500 focus:border-sky-600 dark:focus:ring-sky-500 dark:focus:border-sky-500 bg-sky-50 text-sky-900 placeholder-sky-700 dark:text-sky-400 dark:placeholder-sky-500 dark:bg-gray-700"
      },
      indigo: {
        input: "border border-indigo-200 dark:border-indigo-400 focus:ring-indigo-500 focus:border-indigo-600 dark:focus:ring-indigo-500 dark:focus:border-indigo-500 bg-indigo-50 text-indigo-900 placeholder-indigo-700 dark:text-indigo-400 dark:placeholder-indigo-500 dark:bg-gray-700"
      },
      lime: {
        input: "border border-lime-200 dark:border-lime-400 focus:ring-lime-500 focus:border-lime-600 dark:focus:ring-lime-500 dark:focus:border-lime-500 bg-lime-50 text-lime-900 placeholder-lime-700 dark:text-lime-400 dark:placeholder-lime-500 dark:bg-gray-700"
      },
      amber: {
        input: "border border-amber-200 dark:border-amber-400 focus:ring-amber-500 focus:border-amber-600 dark:focus:ring-amber-500 dark:focus:border-amber-500 bg-amber-50 text-amber-900 placeholder-amber-700 dark:text-amber-400 dark:placeholder-amber-500 dark:bg-gray-700"
      },
      violet: {
        input: "border border-violet-200 dark:border-violet-400 focus:ring-violet-500 focus:border-violet-600 dark:focus:ring-violet-500 dark:focus:border-violet-500 bg-violet-50 text-violet-900 placeholder-violet-700 dark:text-violet-400 dark:placeholder-violet-500 dark:bg-gray-700"
      },
      purple: {
        input: "border border-purple-200 dark:border-purple-400 focus:ring-purple-500 focus:border-purple-600 dark:focus:ring-purple-500 dark:focus:border-purple-500 bg-purple-50 text-purple-900 placeholder-purple-700 dark:text-purple-400 dark:placeholder-purple-500 dark:bg-gray-700"
      },
      fuchsia: {
        input: "border border-fuchsia-200 dark:border-fuchsia-400 focus:ring-fuchsia-500 focus:border-fuchsia-600 dark:focus:ring-fuchsia-500 dark:focus:border-fuchsia-500 bg-fuchsia-50 text-fuchsia-900 placeholder-fuchsia-700 dark:text-fuchsia-400 dark:placeholder-fuchsia-500 dark:bg-gray-700"
      },
      pink: {
        input: "border border-pink-200 dark:border-pink-400 focus:ring-pink-500 focus:border-pink-600 dark:focus:ring-pink-500 dark:focus:border-pink-500 bg-pink-50 text-pink-900 placeholder-pink-700 dark:text-pink-400 dark:placeholder-pink-500 dark:bg-gray-700"
      },
      rose: {
        input: "border border-rose-200 dark:border-rose-400 focus:ring-rose-500 focus:border-rose-600 dark:focus:ring-rose-500 dark:focus:border-rose-500 bg-rose-50 text-rose-900 placeholder-rose-700 dark:text-rose-400 dark:placeholder-rose-500 dark:bg-gray-700"
      }
    },
    group: {
      false: { input: "rounded-lg" },
      true: {
        input: "first:rounded-s-lg last:rounded-e-lg not-first:-ms-px"
      }
    }
  },
  defaultVariants: {
    size: "md",
    color: "default"
  }
});
ce({
  base: "text-sm rtl:text-right font-medium block",
  variants: {
    color: {
      disabled: "text-gray-500 dark:text-gray-500",
      primary: "text-primary-700 dark:text-primary-500",
      secondary: "text-secondary-700 dark:text-secondary-500",
      green: "text-green-700 dark:text-green-500",
      emerald: "text-emerald-700 dark:text-emerald-500",
      red: "text-red-700 dark:text-red-500",
      blue: "text-blue-700 dark:text-blue-500",
      yellow: "text-yellow-700 dark:text-yellow-500",
      orange: "text-orange-700 dark:text-orange-500",
      gray: "text-gray-700 dark:text-gray-200",
      teal: "text-teal-700 dark:text-teal-500",
      cyan: "text-cyan-700 dark:text-cyan-500",
      sky: "text-sky-700 dark:text-sky-500",
      indigo: "text-indigo-700 dark:text-indigo-500",
      lime: "text-lime-700 dark:text-lime-500",
      amber: "text-amber-700 dark:text-amber-500",
      violet: "text-violet-700 dark:text-violet-500",
      purple: "text-purple-700 dark:text-purple-500",
      fuchsia: "text-fuchsia-700 dark:text-fuchsia-500",
      pink: "text-pink-700 dark:text-pink-500",
      rose: "text-rose-700 dark:text-rose-500"
    }
  }
});
ce({
  slots: {
    defaultDiv: "absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none",
    phonesvg: "w-4 h-4 text-gray-500 dark:text-gray-400",
    defaultInput: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500",
    floatingSpan: "absolute start-0 bottom-3 text-gray-500 dark:text-gray-400",
    floatingInput: "block py-2.5 ps-6 pe-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-primary-500 focus:outline-none focus:ring-0 focus:border-primary-600 peer",
    labelFloating: "absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:text-primary-600 peer-focus:dark:text-primary-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
  },
  variants: {
    phoneType: {
      default: {},
      floating: {
        phonesvg: "w-4 h-4 rtl:rotate-[270deg]"
      },
      countryCode: {
        defaultInput: "rounded-none rounded-e-lg"
      },
      copy: {},
      advanced: {}
    },
    phoneIcon: {
      true: { defaultInput: "ps-10" },
      false: {}
    }
  }
});
ce({
  slots: {
    input: "flex items-center w-4 h-4 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 focus:ring-2 mr-2",
    label: "flex items-center"
  },
  variants: {
    color: {
      // primary, secondary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
      primary: {
        input: "text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600"
      },
      secondary: {
        input: "text-secondary-600 focus:ring-secondary-500 dark:focus:ring-secondary-600"
      },
      gray: {
        input: "text-gray-600 focus:ring-gray-500 dark:focus:ring-gray-600"
      },
      red: { input: "text-red-600 focus:ring-red-500 dark:focus:ring-red-600" },
      orange: {
        input: "text-orange-500 focus:ring-orange-500 dark:focus:ring-orange-600"
      },
      amber: {
        input: "text-amber-600 focus:ring-amber-500 dark:focus:ring-amber-600"
      },
      yellow: {
        input: "text-yellow-400 focus:ring-yellow-500 dark:focus:ring-yellow-600"
      },
      lime: {
        input: "text-lime-600 focus:ring-lime-500 dark:focus:ring-lime-600"
      },
      green: {
        input: "text-green-600 focus:ring-green-500 dark:focus:ring-green-600"
      },
      emerald: {
        input: "text-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-600"
      },
      teal: {
        input: "text-teal-600 focus:ring-teal-500 dark:focus:ring-teal-600"
      },
      cyan: {
        input: "text-cyan-600 focus:ring-cyan-500 dark:focus:ring-cyan-600"
      },
      sky: { input: "text-sky-600 focus:ring-sky-500 dark:focus:ring-sky-600" },
      blue: {
        input: "text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600"
      },
      indigo: {
        input: "text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
      },
      violet: {
        input: "text-violet-600 focus:ring-violet-500 dark:focus:ring-violet-600"
      },
      purple: {
        input: "text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-600"
      },
      fuchsia: {
        input: "text-fuchsia-600 focus:ring-fuchsia-500 dark:focus:ring-fuchsia-600"
      },
      pink: {
        input: "text-pink-600 focus:ring-pink-500 dark:focus:ring-pink-600"
      },
      rose: {
        input: "text-rose-600 focus:ring-rose-500 dark:focus:ring-rose-600"
      }
    },
    tinted: {
      true: { input: "dark:bg-gray-600 dark:border-gray-500" },
      false: { input: "dark:bg-gray-700 dark:border-gray-600" }
    },
    custom: {
      true: { input: "sr-only peer" },
      false: { input: "relative" }
    },
    inline: {
      true: { label: "inline-flex" },
      false: { label: "flex" }
    }
  },
  defaultVariants: {
    color: "primary"
  }
});
ce({
  base: "",
  variants: {
    inline: {
      true: "inline-flex",
      false: "flex"
    }
  },
  defaultVariants: {
    inline: true
  }
});
ce({
  base: "w-full bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700",
  variants: {
    size: {
      sm: "h-1 range-sm",
      md: "h-2",
      lg: "h-3 range-lg"
    },
    color: {
      // other colors do not work
      gray: "",
      red: "",
      blue: "",
      indigo: "",
      violet: "",
      purple: "",
      fuchsia: "",
      pink: "",
      rose: ""
    },
    appearance: {
      auto: "range accent-red-500",
      none: "appearance-none"
    }
  },
  compoundVariants: [
    {
      appearance: "auto",
      color: "gray",
      class: "accent-gray-500"
    },
    {
      appearance: "auto",
      color: "red",
      class: "accent-red-500"
    },
    {
      appearance: "auto",
      color: "blue",
      class: "accent-blue-500"
    },
    {
      appearance: "auto",
      color: "indigo",
      class: "accent-indigo-500"
    },
    {
      appearance: "auto",
      color: "violet",
      class: "accent-violet-500"
    },
    {
      appearance: "auto",
      color: "purple",
      class: "accent-purple-500"
    },
    {
      appearance: "auto",
      color: "fuchsia",
      class: "accent-fuchsia-500"
    },
    {
      appearance: "auto",
      color: "pink",
      class: "accent-pink-500"
    },
    {
      appearance: "auto",
      color: "rose",
      class: "accent-rose-500"
    }
  ]
});
ce({
  slots: {
    base: "relative w-full",
    leftDiv: "absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none",
    icon: "text-gray-500 dark:text-gray-400",
    content: "absolute inset-y-0 end-0 flex items-center text-gray-500 dark:text-gray-400",
    input: "block w-full text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500",
    clearbtn: "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
  },
  variants: {
    size: {
      sm: {
        input: "text-xs p-2 ps-9 pe-9 ",
        icon: "w-3 h-3"
        // leftDiv: 'ps-2.5',
      },
      md: {
        input: "text-sm p-2.5 ps-10 pe-10",
        icon: "w-4 h-4"
        // leftDiv: 'ps-10',
      },
      lg: {
        input: "sm:text-base p-3 ps-11 pe-11",
        icon: "w-6 h-6"
        // leftDiv: 'ps-11',
      }
    }
  },
  defaultVariants: {
    size: "lg"
  }
});
ce({
  slots: {
    base: "border bg-gray-50 border-gray-300 rounded-lg flex focus-within:ring-primary-500 focus-within:ring-1 focus-within:border-primary-500 overflow-x-auto scrollbar-hidden",
    tag: "flex items-center rounded-lg bg-gray-100 text-gray-900 border border-gray-300 my-1 ml-1 px-2 text-sm max-w-full min-w-fit",
    span: "items-center",
    close: "my-auto ml-1",
    input: "block text-sm m-2.5 p-0 bg-transparent border-none outline-none text-gray-900 h-min w-full min-w-fit focus:ring-0 placeholder-gray-400"
  }
});
ce({
  slots: {
    divWrapper: "relative",
    base: "block text-sm border-0 px-0 bg-inherit dark:bg-inherit focus:outline-hidden focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
    wrapper: "text-sm rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:placeholder-gray-400 dark:text-white border border-gray-200 dark:border-gray-500",
    innerWrapper: "py-2 px-4 bg-white dark:bg-gray-800",
    headerCls: "py-2 px-3 border-gray-200 dark:border-gray-500",
    footerCls: "py-2 px-3 border-gray-200 dark:border-gray-500",
    addonCls: "absolute top-2 right-2 z-10",
    clearbtn: "absolute right-2 top-5 -translate-y-1/2 text-gray-400 hover:text-black"
  },
  variants: {
    cols: {
      false: {
        base: "w-full",
        wrapper: "w-full"
      }
    },
    wrapped: {
      false: { wrapper: "p-2.5 text-sm focus:outline-hidden focus:ring-primary-500 border-gray-300 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50" }
    },
    hasHeader: {
      true: {
        headerCls: "border-b"
      },
      false: {
        innerWrapper: "rounded-t-lg"
      }
    },
    hasFooter: {
      true: {
        footerCls: "border-t"
      },
      false: {
        innerWrapper: "rounded-b-lg"
      }
    }
  }
});
ce({
  slots: {
    span: "me-3 shrink-0 bg-gray-200 rounded-full peer-focus:ring-4 peer-checked:after:translate-x-full peer-checked:rtl:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border after:rounded-full after:transition-all dark:bg-gray-600 dark:border-gray-500 relative ",
    label: "flex items-center",
    input: "w-4 h-4 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 focus:ring-2 rounded-sm dark:bg-gray-700 dark:border-gray-600 sr-only peer"
  },
  variants: {
    disabled: {
      true: { label: "cursor-not-allowed opacity-50" }
    },
    checked: {
      true: "",
      false: ""
    },
    off_state_label: {
      true: { span: "ms-3" }
    },
    color: {
      // primary, secondary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
      primary: {
        span: "peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 peer-checked:bg-primary-600"
      },
      secondary: {
        span: "peer-focus:ring-secondary-300 dark:peer-focus:ring-secondary-800 peer-checked:bg-secondary-600"
      },
      gray: {
        span: "peer-focus:ring-gray-300 dark:peer-focus:ring-gray-800 peer-checked:bg-gray-500"
      },
      red: {
        span: "peer-focus:ring-red-300 dark:peer-focus:ring-red-800 peer-checked:bg-red-600"
      },
      orange: {
        span: "peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:bg-orange-500"
      },
      amber: {
        span: "peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 peer-checked:bg-amber-600"
      },
      yellow: {
        span: "peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 peer-checked:bg-yellow-400"
      },
      lime: {
        span: "peer-focus:ring-lime-300 dark:peer-focus:ring-lime-800 peer-checked:bg-lime-500"
      },
      green: {
        span: "peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:bg-green-600"
      },
      emerald: {
        span: "peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 peer-checked:bg-emerald-600"
      },
      teal: {
        span: "peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 peer-checked:bg-teal-600"
      },
      cyan: {
        span: "peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 peer-checked:bg-cyan-600"
      },
      sky: {
        span: "peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 peer-checked:bg-sky-600"
      },
      blue: {
        span: "peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:bg-blue-600"
      },
      indigo: {
        span: "peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 peer-checked:bg-indigo-600"
      },
      violet: {
        span: "peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 peer-checked:bg-violet-600"
      },
      purple: {
        span: "peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:bg-purple-600"
      },
      fuchsia: {
        span: "peer-focus:ring-fuchsia-300 dark:peer-focus:ring-fuchsia-800 peer-checked:bg-fuchsia-600"
      },
      pink: {
        span: "peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 peer-checked:bg-pink-600"
      },
      rose: {
        span: "peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 peer-checked:bg-rose-600"
      }
    },
    size: {
      small: {
        span: "w-9 h-5 after:top-[2px] after:start-[2px] after:h-4 after:w-4"
      },
      default: {
        span: "w-11 h-6 after:top-0.5 after:start-[2px] after:h-5 after:w-5"
      },
      large: {
        span: "w-14 h-7 after:top-0.5 after:start-[4px]  after:h-6 after:w-6"
      }
    }
  },
  defaultVariants: {
    color: "primary"
  }
});
ce({
  base: "inline-flex items-center hover:underline",
  variants: {
    color: {
      // primary, secondary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
      primary: "text-primary-600 dark:text-primary-500",
      secondary: "text-secondary-600 dark:text-secondary-500",
      gray: "text-gray-600 dark:text-gray-500",
      red: "text-red-600 dark:text-red-500",
      orange: "text-orange-600 dark:text-orange-500",
      amber: "text-amber-600 dark:text-amber-500",
      yellow: "text-yellow-600 dark:text-yellow-500",
      lime: "text-lime-600 dark:text-lime-500",
      green: "text-green-600 dark:text-green-500",
      emerald: "text-emerald-600 dark:text-emerald-500",
      teal: "text-teal-600 dark:text-teal-500",
      cyan: "text-cyan-600 dark:text-cyan-500",
      sky: "text-sky-600 dark:text-sky-500",
      blue: "text-blue-600 dark:text-blue-500",
      indigo: "text-indigo-600 dark:text-indigo-500",
      violet: "text-violet-600 dark:text-violet-500",
      purple: "text-purple-600 dark:text-purple-500",
      fuchsia: "text-fuchsia-600 dark:text-fuchsia-500",
      pink: "text-pink-600 dark:text-pink-500",
      rose: "text-rose-600 dark:text-rose-500"
    }
  }
});
ce({
  base: "font-semibold text-gray-900 dark:text-white",
  variants: {
    border: {
      true: "border-s-4 border-gray-300 dark:border-gray-500",
      false: ""
    },
    italic: {
      true: "italic",
      false: ""
    },
    bg: {
      true: "bg-gray-50 dark:bg-gray-800",
      false: ""
    },
    alignment: {
      left: "text-left",
      center: "text-center",
      right: "text-right"
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
      "6xl": "text-6xl",
      "7xl": "text-7xl",
      "8xl": "text-8xl",
      "9xl": "text-9xl"
    }
  },
  defaultVariants: {
    border: false,
    italic: true,
    bg: false,
    alignment: "left",
    size: "lg"
  }
});
ce({
  variants: {
    tag: {
      dt: "text-gray-500 md:text-lg dark:text-gray-400",
      dd: "text-lg font-semibold"
    }
  },
  defaultVariants: {
    tag: "dt"
  }
});
ce({
  base: "font-bold text-gray-900 dark:text-white",
  variants: {
    tag: {
      h1: "text-5xl font-extrabold",
      h2: "text-4xl",
      h3: "text-3xl",
      h4: "text-2xl",
      h5: "text-xl",
      h6: "text-lg"
    }
  },
  defaultVariants: {
    tag: "h1"
  }
});
ce({
  slots: {
    base: "h-px my-8 bg-gray-200 border-0 dark:bg-gray-700",
    container: "inline-flex items-center justify-center w-full",
    content: "absolute px-4 -translate-x-1/2 rtl:translate-x-1/2 bg-white start-1/2 dark:bg-gray-900"
  },
  variants: {
    withChildren: {
      true: {
        base: "w-full",
        container: "relative"
      }
    }
  },
  defaultVariants: {
    withChildren: false
  }
});
ce({
  slots: {
    base: "max-w-full h-auto",
    figure: "",
    figureCaption: "mt-2 text-sm text-center text-gray-500 dark:text-gray-400"
  },
  variants: {
    size: {
      xs: { base: "max-w-xs", figure: "max-w-xs" },
      sm: { base: "max-w-sm", figure: "max-w-sm" },
      md: { base: "max-w-md", figure: "max-w-md" },
      lg: { base: "max-w-lg", figure: "max-w-lg" },
      xl: { base: "max-w-xl", figure: "max-w-xl" },
      "2xl": { base: "max-w-2xl", figure: "max-w-2xl" },
      full: { base: "max-w-full", figure: "max-w-full" },
      none: { base: "", figure: "" }
    },
    effect: {
      grayscale: {
        base: "cursor-pointer rounded-lg grayscale filter transition-all duration-300 hover:grayscale-0"
      },
      blur: { base: "blur-xs transition-all duration-300 hover:blur-none" },
      invert: {
        base: "invert filter transition-all duration-300 hover:invert-0"
      },
      sepia: {
        base: "sepia filter transition-all duration-300 hover:sepia-0"
      },
      saturate: {
        base: "saturate-50 filter transition-all duration-300 hover:saturate-100"
      },
      "hue-rotate": {
        base: "hue-rotate-60 filter transition-all duration-300 hover:hue-rotate-0"
      },
      none: {
        base: "transition-all duration-300"
      }
    }
  }
});
ce({
  base: "grid grid-cols-1 sm:grid-cols-2"
});
ce({
  base: "",
  variants: {
    tag: {
      ul: "list-disc",
      dl: "list-none",
      ol: "list-decimal"
    },
    position: {
      inside: "list-inside",
      outside: "list-outside"
    }
  },
  defaultVariants: {
    position: "inside",
    tag: "ul"
  }
});
ce({
  base: "text-white dark:bg-blue-500 bg-blue-600 px-2 rounded-sm"
});
ce({
  base: "text-gray-900 dark:text-white",
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
      "6xl": "text-6xl",
      "7xl": "text-7xl",
      "8xl": "text-8xl",
      "9xl": "text-9xl"
    },
    weight: {
      thin: "font-thin",
      extralight: "font-extralight",
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
      black: "font-black"
    },
    space: {
      tighter: "tracking-tighter",
      tight: "tracking-tight",
      normal: "tracking-normal",
      wide: "tracking-wide",
      wider: "tracking-wider",
      widest: "tracking-widest"
    },
    height: {
      none: "leading-none",
      tight: "leading-tight",
      snug: "leading-snug",
      normal: "leading-normal",
      relaxed: "leading-relaxed",
      loose: "leading-loose",
      "3": "leading-3",
      "4": "leading-4",
      "5": "leading-5",
      "6": "leading-6",
      "7": "leading-7",
      "8": "leading-8",
      "9": "leading-9",
      "10": "leading-10"
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right"
    },
    whitespace: {
      normal: "whitespace-normal",
      nowrap: "whitespace-nowrap",
      pre: "whitespace-pre",
      preline: "whitespace-pre-line",
      prewrap: "whitespace-pre-wrap"
    },
    italic: {
      true: "italic"
    },
    firstUpper: {
      true: "first-line:uppercase first-line:tracking-widest first-letter:text-7xl first-letter:font-bold first-letter:text-gray-900 dark:first-letter:text-gray-100 first-letter:me-3 first-letter:float-left",
      false: ""
    },
    justify: {
      true: "text-justify",
      false: ""
    }
  }
});
ce({
  base: "text-gray-500 dark:text-gray-400 font-semibold"
});
ce({
  variants: {
    italic: {
      true: "italic"
    },
    underline: {
      true: "underline decoration-2 decoration-blue-400 dark:decoration-blue-600"
    },
    linethrough: {
      true: "line-through"
    },
    uppercase: {
      true: "uppercase"
    },
    gradient: {
      skyToEmerald: "text-transparent bg-clip-text bg-linear-to-r to-emerald-600 from-sky-400",
      purpleToBlue: "text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-blue-500",
      pinkToOrange: "text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-orange-400",
      tealToLime: "text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-lime-300",
      redToYellow: "text-transparent bg-clip-text bg-linear-to-r from-red-600 to-yellow-500",
      indigoToCyan: "text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-cyan-400",
      fuchsiaToRose: "text-transparent bg-clip-text bg-linear-to-r from-fuchsia-500 to-rose-500",
      amberToEmerald: "text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-emerald-500",
      violetToRed: "text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-red-500",
      blueToGreen: "text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-teal-500 to-green-400",
      orangeToPurple: "text-transparent bg-clip-text bg-linear-to-r from-orange-400 via-pink-500 to-purple-500",
      yellowToRed: "text-transparent bg-clip-text bg-linear-to-r from-yellow-200 via-indigo-400 to-red-600",
      none: ""
    },
    highlight: {
      blue: "text-blue-600 dark:text-blue-500",
      green: "text-green-600 dark:text-green-500",
      red: "text-red-600 dark:text-red-500",
      yellow: "text-yellow-600 dark:text-yellow-500",
      purple: "text-purple-600 dark:text-purple-500",
      pink: "text-pink-600 dark:text-pink-500",
      indigo: "text-indigo-600 dark:text-indigo-500",
      teal: "text-teal-600 dark:text-teal-500",
      orange: "text-orange-600 dark:text-orange-500",
      cyan: "text-cyan-600 dark:text-cyan-500",
      fuchsia: "text-fuchsia-600 dark:text-fuchsia-500",
      amber: "text-amber-600 dark:text-amber-500",
      lime: "text-lime-600 dark:text-lime-500",
      none: ""
    },
    decoration: {
      solid: "underline decoratio-solid",
      double: "underline decoration-double",
      dotted: "underline decoration-dotted",
      dashed: "underline decoration-dashed",
      wavy: "underline decoration-wavy",
      none: "decoration-none"
    },
    decorationColor: {
      // blue, green, red, yellow, purple, pink, indigo, teal, orange, cyan, fuchsia, amber, lime, none
      // radio
      // primary, secondary, gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
      primary: "underline decoration-primary-400 dark:decoration-primary-600",
      secondary: "underline decoration-secondary-400 dark:decoration-secondary-600",
      gray: "underline decoration-gray-400 dark:decoration-gray-600",
      orange: "underline decoration-orange-400 dark:decoration-orange-600",
      red: "underline decoration-red-400 dark:decoration-red-600",
      yellow: "underline decoration-yellow-400 dark:decoration-yellow-600",
      lime: "underline decoration-lime-400 dark:decoration-lime-600",
      green: "underline decoration-green-400 dark:decoration-green-600",
      emerald: "underline decoration-emerald-400 dark:decoration-emerald-600",
      teal: "underline decoration-teal-400 dark:decoration-teal-600",
      cyan: "underline decoration-cyan-400 dark:decoration-cyan-600",
      sky: "underline decoration-sky-400 dark:decoration-sky-600",
      blue: "underline decoration-blue-400 dark:decoration-blue-600",
      indigo: "underline decoration-indigo-400 dark:decoration-indigo-600",
      violet: "underline decoration-violet-400 dark:decoration-violet-600",
      purple: "underline decoration-purple-400 dark:decoration-purple-600",
      fuchsia: "underline decoration-fuchsia-400 dark:decoration-fuchsia-600",
      pink: "underline decoration-pink-400 dark:decoration-pink-600",
      rose: "underline decoration-rose-400 dark:decoration-rose-600",
      none: "decoration-none"
    },
    decorationThickness: {
      "1": "underline decoration-1",
      "2": "underline decoration-2",
      "4": "underline decoration-4",
      "8": "underline decoration-8",
      "0": "decoration-0"
    }
  }
});
function Posts($$payload, $$props) {
  push();
  let { data, size = 6, summary = true } = $$props;
  function getPages(posts2, size2, path) {
    let l = posts2.length;
    if (!path) {
      path = "/";
    }
    let numPages = Math.floor(l / size2);
    if (l % size2 !== 0) {
      numPages++;
    }
    return _$1.map(_$1.range(numPages), (i) => {
      let _index = i + 1;
      return { name: _index, href: `${path}${_index}` };
    });
  }
  function getPosts(allPosts, slug2, size2) {
    let _startIndex = (slug2 - 1) * size2;
    let _endIndex = _startIndex + size2;
    let posts2 = allPosts.slice(_startIndex, _endIndex);
    return posts2;
  }
  let slug = 1;
  let pages = getPages(data.posts, size);
  let posts = [];
  let currentSlug = slug;
  run(() => {
    if (!data.slug) {
      currentSlug = slug;
    } else {
      currentSlug = data.slug;
    }
    posts = getPosts(data.posts, currentSlug, size);
  });
  $$payload.out += `<div class="content-wrapper prose svelte-16bv18x">`;
  if (posts.length > 0) {
    $$payload.out += "<!--[-->";
    const each_array = ensure_array_like(posts);
    $$payload.out += `<!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let post = each_array[$$index];
      Post($$payload, { post });
    }
    $$payload.out += `<!--]-->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div>No posts yet?</div>`;
  }
  $$payload.out += `<!--]--></div> <div class="pager-wrapper svelte-16bv18x">`;
  Pagination($$payload, { pages, large: true });
  $$payload.out += `<!----></div>`;
  pop();
}

export { Posts as P };
//# sourceMappingURL=Posts2-C-k9J3kS.js.map
