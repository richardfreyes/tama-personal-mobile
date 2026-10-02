# 🎨 Style Guide & UI System

This document serves as the source of truth for the application's design system, referencing the actual implementation in the codebase.

## 🏗 Directory Structure

Styles are decoupled from components and organized by domain.

```text
styles/
├── common/
│   ├── colors.ts       # Color palette definitions
│   ├── globals.ts      # Shared utility styles (layout, inputs)
│   └── typography.ts   # Font size constants
├── components/         # Component-specific stylesheets
│   ├── AppButton.ts
│   ├── FloatingNavBar.ts
│   ├── HeaderComponent.ts
│   └── ...
├── app/                # Screen-specific styles (mirrors app/(app) routes)
├── auth/               # Screen-specific styles (mirrors app/(auth) routes)
├── root.ts             # Root screen (auth guard) styles
└── theme.ts            # React Native Paper theme configuration
```

> **Naming conventions:**
>
> - Style files are named after the component or screen they style; if a component is renamed, rename its style file in the same change.
> - Style files use the `.ts` extension (they contain no JSX).
> - New components should not use a `Component` suffix (prefer `InvoiceItem.tsx` over `InvoiceItemComponent.tsx`); existing suffixed components are renamed opportunistically.
> - New component prop types are declared in the component file itself rather than `types/common.ts`.

-----

## 🎨 Color System

The application uses a semantic palette defined in `styles/common/colors.ts`. Colors are accessed via the `Colors` object.

### Palette Overview

| Palette | Token Range | Usage |
| :--- | :--- | :--- |
| **Aqua** (Primary) | `aqua01` - `aqua10` | Brand identity. `aqua10` (\#31D0DB) is the primary action color. `aqua01` is the lightest tint. |
| **Aegean Blue** | `aegeanBlue01` - `aegeanBlue10` | Secondary UI elements. `aegeanBlue01` is used for container backgrounds. |
| **Neutral** | `neutral01` - `neutral10` | `neutral01` (White) for surfaces. `neutral10` (Black) for main text. `neutral03` for borders. |
| **Support** | `success01` - `10`, `error01` - `10` | Feedback states. `error06` is used for danger buttons. |
| **Special** | `rose`, `amber` | Additional semantic highlights. |

### Usage Example

```typescript
import { Colors } from '@/styles/common/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.aqua10,
    borderColor: Colors.neutral03,
  }
});
```

-----

## 📝 Typography System

The app uses **Poppins** via the `AppText` component. Font sizes are standardized in `styles/common/typography.ts`.

### Font Sizes (`FontSizes`)

| Key | Value |
| :--- | :--- |
| `tiny` | 8 |
| `extraSmall` | 10 |
| `small` | 12 |
| `base` | 14 |
| `medium` | 16 |
| `large` | 18 |
| `extraLarge` | 20 |
| `extraExtraLarge` | 24 |

### Usage via `AppText`

Do not use `Text` directly. Use the `AppText` wrapper for consistency.

```tsx
import { AppText } from '@/components/common/AppText';

// Basic Usage
<AppText size="large" weight="bold">Heading</AppText>

// With Margins (shorthand props)
<AppText mTop={10} color="neutral05">Subtitle</AppText>

// Clickable (URL)
<AppText url="https://example.com" color="info10">Learn More</AppText>
```

#### Props API

  * **`weight`**: `'regular'` | `'medium'` | `'bold'` | `'light'` ... (Mapped to `PoppinsFontNames`)
  * **`size`**: keyof `FontSizes` (e.g., `'base'`, `'large'`)
  * **`color`**: keyof `Colors` (e.g., `'neutral10'`, `'error06'`)
  * **`variant`**: React Native Paper variants (e.g., `'bodyMedium'`)

-----

## 🖌 Global Styles

Common layout patterns and input styles are exported from `styles/common/globals.ts` as `globalStyle`.

### Key Class Names

| Class | Description |
| :--- | :--- |
| `screenContainer` | Standard screen wrapper with `flexGrow: 1` and padding. |
| `outerContainer` | Card-like container with `aegeanBlue01` background and radius. |
| `paperTextInput` | Standard styling for React Native Paper inputs (borderRadius: 4). |
| `inputBase` / `inputFocused` | Styles for custom search/text inputs. |
| `loadingContainer` | Centered flex container for activity indicators. |
| `errorText` | Standard red text for error messages. |

### Usage

```tsx
import { globalStyle } from '@/styles/common/globals';

<View style={globalStyle.screenContainer}>
  <View style={globalStyle.outerContainer}>
     <TextInput style={globalStyle.inputBase} />
  </View>
</View>
```

-----

## 🧩 Component Library

### 1\. AppButton

A multi-variant button component.

  * **Definition:** `components/common/AppButton.tsx`
  * **Styles:** `styles/components/AppButton.ts`

#### Variants

| Variant | Visual Style |
| :--- | :--- |
| `primary` | Solid `aqua10` background, White text. |
| `secondary` | Light `aqua02` background, Aqua text. |
| `tertiary` | Transparent background, Aqua text & border. |
| `quaternary` | Transparent background, AegeanBlue text & border. |
| `danger` | Solid `error06` background, White text. |

#### Usage

```tsx
<AppButton 
  title="Submit" 
  variant="primary" 
  onPress={handleSubmit} 
  isLoading={loading} 
  disabled={!isValid}
/>
```

### 2\. FloatingNavBar

Custom bottom navigation bar with shadow elevation and absolute positioning.

  * **Definition:** `components/layout/FloatingNavBar.tsx`
  * **Styles:** `styles/components/FloatingNavBar.ts`

#### Characteristics

  * **Position:** Absolute, floating 24px from bottom.
  * **Active State:** Icon fills with `Colors.aqua10`.
  * **Inactive State:** Icon fills with configured inactive color.

-----

## 🖼 Assets & Icons

  * **Format:** SVG for icons, PNG for images.
  * **Location:** `assets/icons/` and `assets/images/`.
  * **Libraries:** Uses `react-native-svg` for icon rendering.

### Common Icons

  * `search.svg`, `home.svg`, `bills.svg`, `user.svg`, `logout.svg`

-----

## 🛠 Best Practices (Current Codebase)

1.  **Style Separation:** Always create a separate file in `styles/components/` for complex component styles.
2.  **Text Spacing:** Use `AppText` margin props (`mBottom`, `mTop`) instead of wrapping text in Views just for spacing.
3.  **Safe Areas:** Wraps screens in `KeyboardAvoidingView` (defined in `_layout.tsx`) and standard padding via `globalStyle.screenContainer`.
4.  **Theme Access:** Access colors directly via `Colors` import rather than the `useTheme` hook, unless using Paper specific features.

### Recommended Video

... [React Native Styling & Theming](https://www.google.com/search?q=https://www.youtube.com/watch%3Fv%3DFjS6oQn0Huw) ...
This video explains structured styling approaches in React Native similar to the separation of concerns used in your `styles/` directory.