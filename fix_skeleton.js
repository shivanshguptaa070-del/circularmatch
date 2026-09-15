
const fs = require('fs');
['apps/web/src/pages/AdminDashboard.tsx', 'apps/web/src/pages/AdminPage.tsx', 'apps/web/src/pages/BuyerAcceptanceSpecPage.tsx', 'apps/web/src/pages/BuyerDashboard.tsx', 'apps/web/src/pages/BuyerRequirementsPage.tsx', 'apps/web/src/pages/ListingMatchesPage.tsx', 'apps/web/src/pages/ListingsPage.tsx', 'apps/web/src/pages/ListWastePage.tsx', 'apps/web/src/pages/MapPage.tsx', 'apps/web/src/pages/MatchDetailPage.tsx', 'apps/web/src/pages/MaterialPassportPage.tsx', 'apps/web/src/pages/SellerDashboard.tsx', 'apps/web/src/components/ui.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    if (content.includes('PageSkeleton, label')) {
      content = content.replace(/PageSkeleton, label=/g, 'PageSkeleton label=');
      changed = true;
    }
    if (content.includes('PageSkeleton label=')) {
      content = content.replace(/<PageSkeleton label=[^>]*\/>/g, '<PageSkeleton />');
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed ' + file);
    }
  }
});

