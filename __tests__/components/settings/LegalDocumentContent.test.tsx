import { describe, expect, it, jest } from '@jest/globals';
import LegalDocumentContent from '@/components/settings/LegalDocumentContent';
import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';

const mockOpenContactLink = jest.fn<(...args: any[]) => any>();

jest.mock('@/utils/legalDocuments', () => ({
  ...jest.requireActual('@/utils/legalDocuments') as any,
  openContactLink: (...args: any[]) => mockOpenContactLink(...args),
}));

describe('LegalDocumentContent', () => {
  it('renders plain text lines as selectable text', () => {
    render(<LegalDocumentContent content={'First line\nSecond line'} />);
    expect(screen.getByText('First line')).toBeTruthy();
    expect(screen.getByText('Second line')).toBeTruthy();
  });

  it('skips blank lines in the content', () => {
    render(<LegalDocumentContent content={'Line one\n\n\nLine two'} />);
    expect(screen.getByText('Line one')).toBeTruthy();
    expect(screen.getByText('Line two')).toBeTruthy();
  });

  it('renders bullet lines with bullet markers', () => {
    render(<LegalDocumentContent content={'- First bullet\n- Second bullet'} />);
    expect(screen.getAllByText('•')).toHaveLength(2);
    expect(screen.getByText('First bullet')).toBeTruthy();
    expect(screen.getByText('Second bullet')).toBeTruthy();
  });

  it('renders nested bullet lines with open circle markers', () => {
    render(<LegalDocumentContent content={'- Top level\n  - Nested item'} />);
    expect(screen.getByText('•')).toBeTruthy();
    expect(screen.getByText('◦')).toBeTruthy();
  });

  it('renders links as tappable text elements', () => {
    render(
      <LegalDocumentContent content={'Visit https://example.com for details'} />,
    );
    const link = screen.getByText('https://example.com');
    expect(link).toBeTruthy();
    expect(link.props.accessibilityRole).toBe('link');
  });

  it('renders email addresses as tappable links', () => {
    render(
      <LegalDocumentContent content={'Contact support@test.com for help'} />,
    );
    const link = screen.getByText('support@test.com');
    expect(link).toBeTruthy();
    expect(link.props.accessibilityRole).toBe('link');
  });

  it('opens a contact link when tapped', () => {
    render(<LegalDocumentContent content={'Email us at hello@test.com today'} />);
    const link = screen.getByText('hello@test.com');
    fireEvent.press(link);
    expect(mockOpenContactLink).toHaveBeenCalledWith('mailto:hello@test.com');
  });

  it('renders tab-delimited content as a table with header and rows', () => {
    const content = 'Category\tDescription\nData\tYour personal info';
    render(<LegalDocumentContent content={content} />);
    expect(screen.getByText('Category')).toBeTruthy();
    expect(screen.getByText('Description')).toBeTruthy();
    expect(screen.getByText('Data')).toBeTruthy();
    expect(screen.getByText('Your personal info')).toBeTruthy();
  });

  it('applies custom style to the wrapper view', () => {
    const style = { marginTop: 10 };
    const { toJSON } = render(
      <LegalDocumentContent content={'Test'} style={style} />,
    );
    const root = toJSON();
    expect(root).toBeTruthy();
  });
});
