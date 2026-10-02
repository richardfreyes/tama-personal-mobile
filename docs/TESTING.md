# Testing Guide & Architecture (Jest + React Native)

## 1. Overview

This project uses **Jest** as the test runner and **React Native Testing Library (RNTL)** for component testing.

* **Jest**: Handles the test environment, assertions, and mocks.
* **RNTL**: Renders components in a virtual environment to interact with them like a user (pressing buttons, finding text).
* **Expo**: Provides the runtime environment; we mock Expo modules when running in the Node-based test environment.

## 2. Directory Structure

We follow a specific structure to keep tests organized alongside source code (or in a dedicated folder).

```text
root/
├── __tests__/             # Jest tests (mirrors the source tree)
│   ├── components/        # Tests for UI components (bills, common, forms, layout, payments)
│   └── utils/             # Tests for pure helper functions
├── __mocks__/
│   ├── svgMock.js         # Jest mock for SVG imports
│   └── server/            # Local Express mock server (not used by Jest)
├── jest.config.js         # Jest configuration settings
├── jest.setup.js          # Global mocks (runs before every test file)
└── package.json           # Scripts definitions
```

## 3. Key Concepts

### A. The "Mocking" Strategy

Since Jest runs in Node.js (computer), not on a phone, it cannot access native device features like Camera, Linking, or Bluetooth. We "mock" these.

* **What is a Mock?**: A fake version of a native module that returns predictable data.
* **Where are they?**:
* **Global Mocks**: Located in `jest.setup.js`. These run automatically.
* **Local Mocks**: Inside specific `.test.tsx` files using `jest.mock(...)`.



### B. Testing Philosophy

We prioritize **Behavioral Testing** over Implementation Testing.

* **DO:** Test that clicking "Save" calls the API and shows a success message.
* **DON'T:** Test the internal state of a variable inside the component.

## 4. How to Run Tests

### Command Line

Open your terminal and run:

| Command | Description |
| --- | --- |
| `npm test` | Runs all tests once. |
| `npm run test:watch` | Watch mode. Re-runs tests automatically when you save a file. |
| `npm run test:coverage` | Generates a coverage report showing the percentage of code (components, lines, and functions) tested. |
| `npm test AppText` | Runs only the test file matching "AppText". |

### Understanding Output

* **PASS (Green)**: Logic works as expected.
* **FAIL (Red)**: Something broke.
* Look for the `Expected` vs `Received` diff.
* Check the stack trace to see which line failed.



## 5. Writing a Test Case (Template)

Here is a standard pattern for a test file.

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import MyComponent from '@/components/common/MyComponent';

describe('MyComponent', () => {
  // 1. Setup (Optional)
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 2. The Test
  it('displays the title and handles button press', () => {
    // ARRANGE: Render the component
    render(<MyComponent title="Hello World" />);

    // ASSERT: Check initial state
    expect(screen.getByText('Hello World')).toBeTruthy();

    // ACT: Simulate User Interaction
    const button = screen.getByText('Submit');
    fireEvent.press(button);

    // ASSERT: Check result (e.g., function called, navigation happened)
    // expect(mockFunction).toHaveBeenCalled();
  });
});

```

## 6. Common Pitfalls & Solutions

| Issue | Cause | Solution |
| --- | --- | --- |
| `ReferenceError: x is not defined` | Missing mock for a native module. | Add a mock in `jest.setup.js` or top of test file. |
| `Unable to find element with text...` | The text isn't rendered or is async. | Use `await waitFor(() => ...)` if it appears after a delay. |
| `Snapshot mismatch` | You changed the UI styling/layout. | Verify the change is correct, then run `npm test -- -u`. |

## 7. Resources

* [Jest Documentation](https://jestjs.io/docs/getting-started)
* [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)