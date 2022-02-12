/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import type {Node} from 'react';
import {StyleSheet} from 'react-native';

import Counter from './Counter';

const App: () => Node = () => {
  const [value, setValue] = useState(1);

  const onPressLeftButton = () => setValue(value + 1);
  const onPressRightButton = () => setValue(value - 1);
  return (
    <Counter
      style={styles.block}
      leftButtonText="+1"
      rightButtonText="-1"
      value={value}
      onPressLeftButton={onPressLeftButton}
      onPressRightButton={onPressRightButton}
    />
  );
};

const styles = StyleSheet.create({
  block: {
    flex: 1,
  },
});

export default App;
