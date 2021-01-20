/*
 * Outlier
 * https://github.com/pablodenadai/Outlier
 *
 * Copyright (c) 2014 Pablo De Nadai
 * Licensed under the MIT license.
 */

const calcMedian = (array: number[]) => {
  const half = Math.floor(array.length / 2);

  if (array.length % 2) {
    return array[half];
  } else {
    // There are an even number of elements in the array; the median
    // is the average of the middle two
    return (array[half - 1] + array[half]) / 2;
  }
}

class Stats {
    array: number[] = []

    constructor (array: number[]) {
        if (!array || !(array instanceof Array)) {
            array = [];
        }
    
        array = array.slice(0);
        array.sort((a, b) => a - b)
    
        this.array = array;
    }

    mean () {
      return this.array.reduce((acc, num) => acc + num, 0) / this.array.length
    }

    // Finds the first quartile of the numbers.
    // Returns the first quartile.
    q1 () {
        // The first quartile is the median of the lower half of the numbers
        return calcMedian(this.array.slice(0, Math.floor(this.array.length / 2)))
    }

    // Finds the third quartile of the numbers.
    // Returns the third quartile.
    q3 () {    
        // The third quartile is the median of the upper half of the numbers
        return calcMedian(this.array.slice(Math.ceil(this.array.length / 2)))
    }

    // Finds the interquartile range of the data set.
    // Returns the IQR.
    iqr () {
      return this.q3() - this.q1()
    }

    // Finds all outliers in the data set, using the 1.5 * IQR away from the median test.
    // Returns a new stats object with the outliers.
    findOutliers () {
      // Get the median and the range that the number must fall within
      const median = calcMedian(this.array)
      const range = this.iqr() * 1.5

      // Create a new stats object to hold the outliers
      const outliers = []
      const notOutliers = []

      for (const num of this.array) {
        if (Math.abs(num - median) > range) {
          outliers.push(num)
        } else {
          notOutliers.push(num)
        }
      }

      return {
        outliers,
        notOutliers
      }
    }

    testOutlier (num: number) {
      const median = calcMedian(this.array)
      return (Math.abs(num - median) > this.iqr() * 1.5);
    }
}

export default Stats