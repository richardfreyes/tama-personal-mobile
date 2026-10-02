import { AppText } from '@/components/common/AppText';
import { bulletLinePattern, linkedTextPattern, sampleScenariosHeader, sectionHeadingPattern } from '@/constants/legalDocument';
import { legalStyles as styles } from '@/styles/app/settings/legal';
import { LegalDocumentContentProps } from '@/types';
import type { LegalTableData } from '@/types/legalDocuments';
import { getBulletLevel, getDocumentLines, getLineStyle, getLineWeight, getLinkParts, getTableCells, getTableColumnWidth, openContactLink } from '@/utils/legalDocuments';
import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function LegalDocumentContent({ content, style }: LegalDocumentContentProps) {
  const documentLines = getDocumentLines(content);

  const renderLinkedText = (text: string, keyPrefix: string): ReactNode => {
    const segments: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    linkedTextPattern.lastIndex = 0;

    while ((match = linkedTextPattern.exec(text)) !== null) {
      const matchedText = match[0];
      const { linkedText, trailingText, url } = getLinkParts(matchedText);

      if (match.index > lastIndex) {
        segments.push(text.slice(lastIndex, match.index));
      }

      segments.push(
        <Text
          accessibilityRole="link"
          key={`${keyPrefix}-contact-${match.index}`}
          onPress={() => openContactLink(url)}
          style={styles.inlineLink}
        >
          {linkedText}
        </Text>,
      );

      if (trailingText) {
        segments.push(trailingText);
      }

      lastIndex = match.index + matchedText.length;
    }

    if (lastIndex < text.length) {
      segments.push(text.slice(lastIndex));
    }

    return segments.length > 0 ? segments : text;
  };

  const parseTable = (startIndex: number): LegalTableData => {
    const headerLine = documentLines[startIndex];
    const headerCells = getTableCells(headerLine);
    const rows: string[][] = [];
    let nextIndex = startIndex + 1;
    const shouldMergeContinuationLines = headerLine === sampleScenariosHeader;

    while (nextIndex < documentLines.length) {
      const nextLine = documentLines[nextIndex];
      const rowCells = getTableCells(nextLine);

      if (rowCells.length === headerCells.length) {
        rows.push(rowCells);
        nextIndex += 1;
        continue;
      }

      if (shouldMergeContinuationLines && rows.length > 0 && !sectionHeadingPattern.test(nextLine)) {
        const previousRow = rows[rows.length - 1];
        previousRow[previousRow.length - 1] = `${previousRow[previousRow.length - 1]}\n${nextLine}`;
        nextIndex += 1;
        continue;
      }

      break;
    }

    return { headerCells, rows, nextIndex };
  };

  const renderLine = (line: string, index: number) => (
    <AppText
      key={`${index}-${line}`}
      selectable
      weight={getLineWeight(line, index)}
      style={getLineStyle(line, index)}
    >
      {renderLinkedText(line, `${index}-line`)}
    </AppText>
  );

  const renderBulletLine = (line: string, index: number) => {
    const bulletLevel = getBulletLevel(line);
    const bulletText = line.replace(bulletLinePattern, '');

    return (
      <View
        key={`${index}-${line}`}
        style={[
          styles.bulletRow,
          bulletLevel > 0 ? { marginLeft: bulletLevel * 16 } : null,
        ]}
      >
        <AppText
          selectable={false}
          style={[
            styles.bulletMarker,
            bulletLevel > 0 ? styles.bulletMarkerNested : null,
          ]}
        >
          {bulletLevel > 0 ? '\u25E6' : '\u2022'}
        </AppText>
        <AppText selectable style={styles.bulletText}>
          {renderLinkedText(bulletText, `${index}-bullet`)}
        </AppText>
      </View>
    );
  };

  const renderTable = (headerCells: string[], rows: string[][], index: number) => (
    <ScrollView
      horizontal
      key={`${index}-${headerCells.join('-')}`}
      nestedScrollEnabled
      showsHorizontalScrollIndicator
      style={styles.legalTableScroll}
    >
      <View style={styles.legalTable}>
        <View style={[styles.legalTableRow, styles.legalTableHeaderRow]}>
          {headerCells.map((cell, cellIndex) => {
            const isLast = cellIndex === headerCells.length - 1;

            return (
              <View
                key={`${cellIndex}-${cell}`}
                style={[
                  styles.legalTableCell,
                  !isLast ? styles.legalTableCellBorder : null,
                  { width: getTableColumnWidth(headerCells.length, cellIndex) },
                ]}
              >
                <AppText selectable weight="700" style={styles.legalTableHeaderText}>
                  {cell}
                </AppText>
              </View>
            );
          })}
        </View>

        {rows.map((row, rowIndex) => (
          <View
            key={`${rowIndex}-${row[0]}`}
            style={[
              styles.legalTableRow,
              rowIndex === rows.length - 1 ? styles.legalTableRowLast : null,
            ]}
          >
            {headerCells.map((_, cellIndex) => {
              const isLast = cellIndex === headerCells.length - 1;

              return (
                <View
                  key={`${rowIndex}-${cellIndex}`}
                  style={[
                    styles.legalTableCell,
                    !isLast ? styles.legalTableCellBorder : null,
                    { width: getTableColumnWidth(headerCells.length, cellIndex) },
                  ]}
                >
                  <AppText
                    selectable
                    weight={cellIndex === 0 ? '500' : 'regular'}
                    style={[
                      styles.legalTableBodyText,
                      cellIndex === 0 ? styles.legalTableFirstColumnText : null,
                    ]}
                  >
                    {renderLinkedText(row[cellIndex] || '', `${index}-${rowIndex}-${cellIndex}`)}
                  </AppText>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderDocumentContent = () => {
    const renderedContent: ReactNode[] = [];

    for (let index = 0; index < documentLines.length; index += 1) {
      const line = documentLines[index];

      if (line.includes('\t')) {
        const table = parseTable(index);

        if (table.rows.length > 0) {
          renderedContent.push(renderTable(table.headerCells, table.rows, index));
          index = table.nextIndex - 1;
          continue;
        }
      }

      if (bulletLinePattern.test(line)) {
        renderedContent.push(renderBulletLine(line, index));
        continue;
      }

      renderedContent.push(renderLine(line, index));
    }

    return renderedContent;
  };

  return (
    <View style={style}>
      {renderDocumentContent()}
    </View>
  );
}
