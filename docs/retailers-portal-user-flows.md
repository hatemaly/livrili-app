# Retailers Portal User Flows

## Overview
This document outlines the detailed user flows for the Livrili retailers portal, designed for maximum simplicity and ease of use.

## 1. Registration Flow

```mermaid
graph TD
    A[Landing Page] -->|Click Register| B[Enter Phone Number]
    B -->|Valid Format| C[Enter Business Name]
    B -->|Invalid Format| B1[Show Error - Visual]
    B1 --> B
    C -->|Next| D[Enter Business Address]
    D -->|Next| E[Upload Documents]
    E -->|Skip/Upload| F[Review & Submit]
    F -->|Submit| G[Success Screen]
    G --> H[Waiting for Approval]
    H -->|Approved by Admin| I[SMS Notification]
    I --> J[First Login]
```

### Registration States
- **Phone Entry**: Large numeric keypad, auto-formatting
- **Business Info**: Single field per screen, progress bar
- **Document Upload**: Optional with "Skip for Now" option
- **Waiting**: Show estimated time (24-48 hours)
- **Approved**: SMS with username/password from admin

## 2. Login Flow

```mermaid
graph TD
    A[App Launch] -->|Saved Credentials| B[Auto-Login]
    A -->|No Saved Credentials| C[Login Screen]
    C -->|Enter Username| D[Enter Password]
    D -->|Correct| E[Home Screen]
    D -->|Incorrect 3x| F[Account Locked]
    F -->|Contact Admin| G[WhatsApp Redirect]
    D -->|Forgot Password| G
    B -->|Success| E
    B -->|Fail| C
```

### Login Features
- Remember username on device
- Large touch targets for input
- Clear error messages with icons
- Direct WhatsApp support link

## 3. Product Browsing & Ordering Flow

```mermaid
graph TD
    A[Home Screen] -->|Browse Products| B[Category Grid]
    A -->|Quick Reorder| K[Previous Orders]
    B -->|Select Category| C[Product List]
    C -->|Select Product| D[Product Quick View]
    C -->|Quick Add| E[Add to Cart Animation]
    D -->|Add to Cart| E
    E --> F[Update Cart Badge]
    F --> C
    C -->|View Cart| G[Shopping Cart]
    G -->|Modify Quantity| G1[Update Totals]
    G -->|Remove Item| G2[Confirm Remove]
    G -->|Checkout| H[Delivery Address]
    H -->|Confirm| I[Order Summary]
    I -->|Place Order| J[Order Confirmation]
    J -->|Share| J1[WhatsApp Share]
    K -->|Reorder| G
```

### Browsing Features
- Visual category cards (big icons)
- Infinite scroll product list
- Quick add without leaving list
- Visual feedback for all actions

## 4. Quick Reorder Flow

```mermaid
graph TD
    A[Home Screen] -->|Reorder Button| B[Recent Orders List]
    B -->|Select Order| C[Order Details View]
    C -->|Reorder All| D[Add All to Cart]
    C -->|Modify First| E[Edit Quantities]
    E -->|Confirm Changes| D
    D -->|Success Animation| F[Shopping Cart]
    F -->|Checkout| G[Standard Checkout Flow]
```

## 5. Cart & Checkout Flow

```mermaid
graph TD
    A[Shopping Cart] -->|Review Items| B{Minimum Order Met?}
    B -->|No| C[Show Minimum Required]
    C -->|Add More| D[Continue Shopping]
    B -->|Yes| E[Checkout Button Active]
    E -->|Click Checkout| F{Has Default Address?}
    F -->|Yes| G[Show Address]
    F -->|No| H[Enter Address]
    G -->|Change| H
    G -->|Confirm| I[Order Review]
    H -->|Save & Continue| I
    I -->|Check Credit| J{Credit Available?}
    J -->|Yes| K[Payment Method Selection]
    J -->|No| L[Cash Only Option]
    K -->|Select| M[Final Confirmation]
    L -->|Continue| M
    M -->|Place Order| N[Processing Animation]
    N --> O[Order Success]
    O -->|Done| P[Track Order]
    O -->|Share| Q[WhatsApp Share]
```

### Checkout Features
- Auto-calculate credit availability
- Visual payment method selection
- Clear order summary with images
- One-tap order placement

## 6. Order Management Flow

```mermaid
graph TD
    A[Home Screen] -->|My Orders| B[Orders List]
    B -->|Filter| C[Status Filter]
    C -->|Apply| B
    B -->|Select Order| D[Order Details]
    D -->|Track Delivery| E[Delivery Status]
    E -->|Contact Driver| F[Call/WhatsApp]
    D -->|Reorder| G[Quick Reorder Flow]
    D -->|Report Issue| H[WhatsApp Support]
    E -->|Delivered| I[Rate Experience]
    I -->|Submit| J[Thank You Screen]
```

## 7. Credit Management Flow

```mermaid
graph TD
    A[Home Screen] -->|Credit Balance| B[Credit Dashboard]
    B -->|View Details| C[Transaction History]
    C -->|Filter by Date| D[Filtered List]
    B -->|Payment Due| E[Payment Reminder]
    E -->|Make Payment| F[Payment Instructions]
    F -->|Notify Paid| G[WhatsApp Notification]
    B -->|Credit Limit| H[Request Increase]
    H -->|Submit Request| I[Admin Notification]
```

## Error Handling Patterns

### Network Errors
```mermaid
graph TD
    A[User Action] -->|No Network| B[Check Local Cache]
    B -->|Available| C[Show Cached Data]
    B -->|Not Available| D[Show Offline Message]
    D -->|Retry| E[Check Connection]
    E -->|Connected| F[Sync & Proceed]
    E -->|Still Offline| D
    C -->|User Continues| G[Queue Actions]
    G -->|Connection Restored| H[Sync Queue]
```

### Validation Errors
- Visual indicators (red borders)
- Icon-based error messages
- Inline correction suggestions
- Prevent submission until fixed

## Success Patterns

### Visual Feedback
1. **Add to Cart**: Item flies to cart with number bounce
2. **Order Placed**: Confetti animation + success sound
3. **Login Success**: Welcome message with name
4. **Registration**: Step completion checkmarks

### Confirmation Patterns
- Order confirmation with order number prominently displayed
- WhatsApp share button for order details
- SMS confirmation (when implemented)
- Email receipt (optional)

## Accessibility Flows

### Voice Navigation (Future)
```mermaid
graph TD
    A[Voice Button] -->|Tap| B[Listening State]
    B -->|"Show beverages"| C[Navigate to Beverages]
    B -->|"Add Coca Cola"| D[Search & Add Product]
    B -->|"Checkout"| E[Go to Cart]
    B -->|Not Understood| F[Visual Suggestions]
```

### High Contrast Mode
- Toggle in settings
- Persists across sessions
- Increases all contrast ratios
- Larger touch targets

## Performance Optimization Flows

### Progressive Loading
```mermaid
graph TD
    A[Open Category] -->|Immediate| B[Show Skeleton]
    B -->|Load First 10| C[Display Products]
    C -->|Scroll Down| D[Load Next 10]
    D -->|Repeat| C
    C -->|Image Loading| E[Low Quality First]
    E -->|Progressive| F[High Quality]
```

### Offline Queue
```mermaid
graph TD
    A[Offline Action] -->|Add to Queue| B[Local Storage]
    B -->|Connection Restored| C[Process Queue]
    C -->|Success| D[Update UI]
    C -->|Fail| E[Retry Logic]
    E -->|Max Retries| F[Show Error]
```

## Implementation Notes

### Technical Considerations
1. All flows must complete in ≤3 screens
2. Every action needs visual feedback
3. Error states should suggest solutions
4. Success states should be celebratory
5. Loading states need progress indicators

### UX Principles Applied
- **Simplicity**: One primary action per screen
- **Clarity**: Visual hierarchy guides users
- **Feedback**: Immediate response to all inputs
- **Forgiveness**: Easy to undo/go back
- **Efficiency**: Smart defaults reduce typing