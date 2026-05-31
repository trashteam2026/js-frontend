import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiPlus } from 'react-icons/fi';

import OwnerHeader from '@/common/components/navigation/OwnerHeader';
import useIsMobile from '@/common/hooks/useIsMobile';
import styled from 'styled-components';

import { categoriesApi, itemsApi } from '../../services/api';
import AddCategoryModal from './AddCategoryModal';
import CategorySection from './CategorySection';
import DeleteCategoryModal from './DeleteCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import ItemDetailModal from './ItemDetailModal';
import SortMenu from './SortMenu';
import TabBar from './TabBar';

const PageWrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ececec;
`;

const Fab = styled.button`
  display: none;

  @media (max-width: 767px) {
    display: grid;
    place-items: center;
    position: fixed;
    bottom: 18px;
    right: 18px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: #2c5e95;
    color: #ffffff;
    border: none;
    box-shadow: 0 6px 16px rgba(24, 39, 75, 0.25);
    cursor: pointer;
    z-index: 30;

    svg {
      color: #ffffff;
      stroke: #ffffff;
    }

    svg path,
    svg circle,
    svg line,
    svg polyline {
      stroke: #ffffff;
    }

    &:hover {
      background-color: #1e3a6e;
    }
  }
`;

const AddFab = styled(Fab)`
  @media (max-width: 767px) {
    right: auto;
    left: 18px;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 24px 22px;

  @media (max-width: 767px) {
    padding: 4px 12px 96px;
  }
`;

// Synthetic id for the fallback group that holds items whose category_id is
// NULL or points at a category that no longer exists. A string can't collide
// with the numeric SERIAL ids of real categories.
const UNCATEGORIZED_ID = 'uncategorized';

export default function InventoryPage() {
  const isMobile = useIsMobile();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('food');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSort, setGlobalSort] = useState('alphabetical');
  const [perCategoryOverrides, setPerCategoryOverrides] = useState({});
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [cats, its] = await Promise.all([
        categoriesApi.getAll(),
        itemsApi.getAll(),
      ]);
      setCategories(cats);
      setItems(its);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Merge items into their categories
  const categoriesWithItems = useMemo(() => {
    const merged = categories.map((cat) => ({
      ...cat,
      items: items.filter((item) => item.category_id === cat.id),
    }));

    // Safety net: items whose category_id is NULL or points at a category that
    // no longer exists (e.g. a category row deleted directly in SQL) would
    // otherwise be silently dropped here — invisible in the UI yet still in the
    // DB and scan-out-able by barcode. Surface them in a fallback
    // "Uncategorized" group so they can never become invisible ghosts.
    const knownIds = new Set(categories.map((cat) => cat.id));
    const orphanedItems = items.filter(
      (item) => !knownIds.has(item.category_id)
    );
    if (orphanedItems.length > 0) {
      merged.push({
        id: UNCATEGORIZED_ID,
        name: 'Uncategorized',
        parent_group: null,
        items: orphanedItems,
      });
    }

    return merged;
  }, [categories, items]);

  const foodCategories = useMemo(
    () => categoriesWithItems.filter((c) => c.parent_group === 'food'),
    [categoriesWithItems]
  );

  const nonFoodCategories = useMemo(
    () => categoriesWithItems.filter((c) => c.parent_group === 'non_food'),
    [categoriesWithItems]
  );

  const filteredCategories = useMemo(() => {
    let cats = categoriesWithItems;

    // The Uncategorized fallback has no parent_group; keep it in every tab so
    // orphaned items stay visible regardless of which tab is active.
    if (activeTab === 'food') {
      cats = cats.filter(
        (c) => c.parent_group === 'food' || c.id === UNCATEGORIZED_ID
      );
    } else if (activeTab === 'non_food') {
      cats = cats.filter(
        (c) => c.parent_group === 'non_food' || c.id === UNCATEGORIZED_ID
      );
    }

    if (selectedCategoryId) {
      cats = cats.filter((c) => c.id === selectedCategoryId);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      cats = cats
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) =>
            item.name.toLowerCase().includes(query)
          ),
        }))
        .filter((cat) => cat.items.length > 0);
    }

    cats = cats.map((cat) => {
      const sortMode = perCategoryOverrides[cat.id] ?? globalSort;
      const sortedItems = [...cat.items];
      if (sortMode === 'alphabetical') {
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortMode === 'stock_asc') {
        sortedItems.sort((a, b) => a.total_quantity - b.total_quantity);
      } else if (sortMode === 'stock_desc') {
        sortedItems.sort((a, b) => b.total_quantity - a.total_quantity);
      } else if (sortMode === 'expiration') {
        sortedItems.sort((a, b) => {
          const aExp = a.earliest_expiration;
          const bExp = b.earliest_expiration;
          if (aExp == null && bExp == null) return 0;
          if (aExp == null) return 1;
          if (bExp == null) return -1;
          if (aExp < bExp) return -1;
          if (aExp > bExp) return 1;
          return 0;
        });
      }
      return { ...cat, items: sortedItems };
    });

    return cats;
  }, [
    categoriesWithItems,
    activeTab,
    selectedCategoryId,
    searchQuery,
    globalSort,
    perCategoryOverrides,
  ]);

  const handleItemClick = (item) => {
    setSelectedItemId(item.id);
  };

  // Called when an item is added from CategorySection
  const handleItemAdded = (newItem) => {
    setItems((prev) => [...prev, newItem]);
  };

  // Called when ItemDetailModal deletes an item
  const handleItemDeleted = (deletedId) => {
    setItems((prev) => prev.filter((item) => item.id !== deletedId));
    setSelectedItemId(null);
  };

  // Refresh a single item's data in state (e.g. after threshold edit)
  const handleItemUpdated = (updatedItem) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      )
    );
  };

  // Refresh all items when modal closes (picks up batch qty changes)
  const handleModalClose = useCallback(async () => {
    setSelectedItemId(null);
    try {
      const updatedItems = await itemsApi.getAll();
      setItems(updatedItems);
    } catch (err) {
      console.error('Failed to refresh items:', err);
    }
  }, []);

  const handleRenameCategory = async (newName) => {
    if (!categoryToEdit) return;
    try {
      const updated = await categoriesApi.update(categoryToEdit.id, {
        name: newName,
      });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryToEdit.id
            ? { ...c, name: updated.name ?? newName }
            : c
        )
      );
      setCategoryToEdit(null);
    } catch (err) {
      console.error('Rename category error:', err);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await categoriesApi.delete(categoryToDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      setItems((prev) =>
        prev.filter((i) => i.category_id !== categoryToDelete.id)
      );
      setCategoryToDelete(null);
    } catch (err) {
      console.error('Delete category error:', err);
    }
  };

  const handleAddCategory = async (data) => {
    try {
      const newCat = await categoriesApi.create({
        name: data.name,
        parent_group: data.parentGroup,
      });
      setCategories((prev) => [...prev, { ...newCat, items: [] }]);
      setShowAddCategory(false);
    } catch (err) {
      console.error('Add category error:', err);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 60 }}>
          Loading inventory…
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <OwnerHeader
        active='inventory'
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        foodCategories={foodCategories}
        nonFoodCategories={nonFoodCategories}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={setSelectedCategoryId}
        onAddCategory={() => setShowAddCategory(true)}
        onFilterAll={() => setShowSortMenu(true)}
      />

      <Content>
        {filteredCategories.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>
            No categories found.
          </p>
        ) : (
          filteredCategories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              // The Uncategorized fallback isn't a real category row, so renaming
              // it or adding items to it would have no valid category_id. Render
              // it read-only; the owner recovers an orphan by opening it and
              // reassigning its category (or deleting it) in ItemDetailModal.
              readOnly={category.id === UNCATEGORIZED_ID}
              sortBy={perCategoryOverrides[category.id] ?? globalSort}
              onSortChange={(value) =>
                setPerCategoryOverrides((prev) => ({
                  ...prev,
                  [category.id]: value,
                }))
              }
              onItemClick={handleItemClick}
              onItemAdded={handleItemAdded}
              onEditCategory={setCategoryToEdit}
            />
          ))
        )}
      </Content>

      {showSortMenu && (
        <SortMenu
          activeSort={globalSort}
          onSortChange={(value) => {
            setGlobalSort(value);
            setPerCategoryOverrides({});
          }}
          onClose={() => setShowSortMenu(false)}
          topOffset={105}
        />
      )}

      {selectedItemId && (
        <ItemDetailModal
          itemId={selectedItemId}
          categories={categories}
          onClose={handleModalClose}
          onItemDeleted={handleItemDeleted}
          onItemUpdated={handleItemUpdated}
        />
      )}

      {showAddCategory && (
        <AddCategoryModal
          onClose={() => setShowAddCategory(false)}
          onAdd={handleAddCategory}
        />
      )}

      {categoryToEdit && !categoryToDelete && (
        <EditCategoryModal
          category={categoryToEdit}
          onClose={() => setCategoryToEdit(null)}
          onSave={handleRenameCategory}
          onDeleteRequest={() => {
            setCategoryToDelete(categoryToEdit);
            setCategoryToEdit(null);
          }}
        />
      )}

      {categoryToDelete && (
        <DeleteCategoryModal
          category={categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={handleDeleteCategory}
        />
      )}

      {isMobile && (
        <AddFab
          title='Add Category'
          aria-label='Add Category'
          onClick={() => setShowAddCategory(true)}
        >
          <FiPlus size={26} />
        </AddFab>
      )}
    </PageWrapper>
  );
}
