import _capitalize from 'lodash.capitalize';
import cx from 'classnames';

export function getTransitionClasses(className, state, styles) {
  const s = _capitalize(state);
  const hasStyle = !!styles[`${className}${s}`];
  const classes = cx(styles[className], {
    [styles[`${className}${s}`]]: hasStyle
  });
  return classes;
}
