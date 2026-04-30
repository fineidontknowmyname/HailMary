// ─── BulletList — Clean bullet points with proper text wrapping ──────────────
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
    paddingLeft: 4,
  },
  bulletDot: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: '#222222',
    width: 10,
    // Fixed width ensures multi-line text wraps under the text, not the bullet
  },
  bulletText: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: '#222222',
    flex: 1,
    lineHeight: 1.4,
  },
});

interface BulletListProps {
  items: string[];
}

export function BulletList({ items }: BulletListProps) {
  if (items.length === 0) return null;

  return (
    <>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletRow} wrap={false}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </>
  );
}
