// ─── SplitRow — Left-right aligned row for Title / Date pairs ────────────────
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  left: {
    fontFamily: 'Times-Bold',
    fontSize: 11,
    color: '#000000',
    flex: 1,
    paddingRight: 8,
  },
  right: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: '#444444',
    textAlign: 'right',
    flexShrink: 0,
  },
});

interface SplitRowProps {
  leftContent: string;
  rightContent: string;
}

export function SplitRow({ leftContent, rightContent }: SplitRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.left}>{leftContent}</Text>
      <Text style={styles.right}>{rightContent}</Text>
    </View>
  );
}
