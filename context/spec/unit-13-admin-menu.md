# Spec: Unit 13 — Admin Menu Management

## Goal

Build the administrative menu management interface under `app/(dashboard)/dashboard/menu/` that allows administrators to list all offerings (grouped by category, with search and availability filtering), toggle sold-out states in real time, edit descriptions and prices, upload product photography directly to Supabase Storage, and add/delete menu items while utilizing Next.js cache revalidation to ensure immediate public updates on `/menu`.

---

## Design

The admin menu interface utilizes the **Seoul Serenity** design system. The page displays a responsive operations layout:
- **Header Section**: Displays the title "Menu Management" and a prominent button **+ Add New Item** styled using `--color-primary` background and `--color-text-on-primary` text.
- **Category Tabs**: Horizontal scrollable list filtering the active view by food/drink categories (e.g. Cakes & Pastries, Croffles, Sandwiches, Burgers, Coffees, Teas) matching the mockup `menu_management_cove_admin/code.html`.
- **Search & Filter Bar**:
  - An input search bar with an inline search icon using `--color-surface-container-low` background.
  - A dropdown filter to view "All Items", "In Stock", or "Sold Out".
- **Menu Item Grid**:
  - Renders cards representing products. Each card shows:
    - **Product Image**: Displays the image with a subtle zoom scale on hover. If no image exists, displays a fallback "No Image Added" area with an `image_not_supported` icon.
    - **In Stock / Sold Out Badge**: Overlay in the top-right corner of the image (`bg-surface/90` background with green/red indicator dots).
    - **Item Title & Price**: Displayed in Playfair Display (`--color-text-heading`) and bold Inter font.
    - **Footer Toggle Control**: Styled like a tactile slide toggle. Toggling the checkbox instantly updates the product's availability.
    - **Action Controls**: Inline edit (`edit`) and delete (`delete`) icons using `--color-primary` text.
- **Add / Edit Item Modal Panel**:
  - Renders an elevated modal window using `--color-surface-container-high` background and `--shadow-lg`.
  - Fields: Name (text), Category (select), Description (textarea), Price (number), Seasonal (toggle/checkbox), and Image upload drag-and-drop area.

---

## Implementation

### Folder Layout
Create the files in the following boundary positions:

```
cove/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       └── menu/
│   │           ├── page.tsx                # Admin Menu Management Page
│   │           ├── MenuItemCard.tsx        # Card sub-component with toggle / delete actions
│   │           └── MenuModal.tsx           # Edit / Create modal dialog component
│   └── api/
│       └── admin/
│           └── menu/
│               ├── create/
│               │   └── route.ts            # Insert menu item API (supports storage upload)
│               ├── update/
│               │   └── route.ts            # Update item details API
│               ├── delete/
│               │   └── route.ts            # Delete item API
│               └── toggle-availability/
│                   └── route.ts            # Fast toggling of availability
```

---

### API Actions & Cache Revalidation
Every write operation under the `/api/admin/menu/` routes must:
1. Verify the authenticated session exists and query the `users` table to ensure `role === 'admin'`. If not, return `403 Forbidden`.
2. Process database writes using the Supabase Server Client.
3. Call `revalidatePath('/menu')` to immediately purge Next.js static rendering caches for the public menu, ensuring updates reflect instantly.

#### Image Upload Integration
When uploading an image:
- File is saved to the Supabase Storage bucket `menu-images`.
- Path schema: `public/menu-items/[uuid]-[filename]`.
- Public URL is retrieved and stored as the item's `image_url` attribute.

---

### API Endpoint Interfaces

#### 1. Create Item Endpoint — `/api/admin/menu/create`
- **Method**: `POST`
- **Payload**: `FormData` containing: `name`, `categoryId`, `description`, `price`, `isSeasonal`, and optional `image` file.
- **Logic**:
  - Validates inputs.
  - Uploads file if present.
  - Inserts row into `menu_items`.
  - Triggers public path cache revalidation.

#### 2. Update Item Endpoint — `/api/admin/menu/update`
- **Method**: `PATCH`
- **Payload**: `{ id, name, categoryId, description, price, isSeasonal, imageUrl }` (or `FormData` if replacing image).
- **Logic**:
  - Updates matching row in `menu_items`.
  - Triggers public path cache revalidation.

#### 3. Delete Item Endpoint — `/api/admin/menu/delete`
- **Method**: `DELETE`
- **Payload**: `{ id }`
- **Logic**:
  - Deletes matching row from `menu_items`.
  - If a custom storage image was associated, deletes the image file from the `menu-images` bucket.
  - Triggers public path cache revalidation.

#### 4. Toggle Availability Endpoint — `/api/admin/menu/toggle-availability`
- **Method**: `PATCH`
- **Payload**: `{ id, isAvailable }`
- **Logic**:
  - Updates `is_available` boolean.
  - Triggers public path cache revalidation.

---

### Dashboard Menu page — `app/(dashboard)/dashboard/menu/page.tsx`
- **Data Load**: Fetches categories from `menu_categories` and menu items from `menu_items` (joined to categories).
- **Interactive State**:
  - Manages selected category tabs for client filtering.
  - Manages search query strings and active stock filter dropdown selection.
  - Manages modal visibility states (`isModalOpen: boolean`, `editingItem: MenuItem | null`).

---

## Dependencies

No extra packages to install. Uses native browser `FormData` and Next.js built-in `revalidatePath` functions.

---

## Verification Checklist

### Role-Based Authorization
- [ ] Attempting to access `/dashboard/menu` or execute admin API endpoints with a non-admin session returns unauthorized/redirection errors.

### List & Filtering Operations
- [ ] Menu items render grouped by category, matching the mockup layout.
- [ ] Clicking category tabs updates the filtered grid display.
- [ ] Typing in the search input dynamically filters items by name.
- [ ] Dropdown filter displays "All Items", "In Stock", or "Sold Out" items accurately.

### Availability Toggle
- [ ] Clicking the card footer toggle switch instantly updates the database status of the item.
- [ ] When marked Sold Out:
  - The stock badge changes to "Sold Out" (red indicator).
  - The card opacity decreases to 75% matching `code.html`.
  - The item renders in a disabled greyed-out state on the public `/menu` page.

### Creation & Upload Flow
- [ ] Clicking "+ Add New Item" opens the Menu Modal.
- [ ] Form validates empty fields, negative prices, and invalid formats.
- [ ] Uploading an image file successfully saves the asset to the `menu-images` storage bucket.
- [ ] Submitting the form adds the item to the list.
- [ ] **Instant Cache Revalidation**: Opening the public `/menu` page immediately displays the newly created item without manual page rebuilds.

### Edit & Deletion Flow
- [ ] Clicking the card Edit icon opens the modal pre-filled with the item's values.
- [ ] Submitting edits updates the card details.
- [ ] Clicking the Delete button prompts a confirmation dialog.
- [ ] Confirming deletion removes the row from the database and updates the dashboard grid.
- [ ] Verify deleted items are immediately removed from the public `/menu` view.
