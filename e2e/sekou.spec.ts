import { test, expect } from '@playwright/test';

test.describe('Sekou Draperie - Flux Critiques', () => {

    // On utilise l'admin défini dans le script de seed
    const ADMIN_EMAIL = 'admin@sekou-draperie.com';
    const ADMIN_PASS = 'Admin@Sekou2026';

    test('1. Authentification Admin et accès Dashboard', async ({ page }) => {
        // Redirection vers login forcée avec un grand timeout (Next.js compile la page localement)
        await page.goto('/', { timeout: 90000 });
        await expect(page).toHaveURL(/.*\/login/, { timeout: 60000 });

        // Remplissage du formulaire
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', ADMIN_PASS);
        
        // Clic sur le bouton de connexion
        await page.click('button[type="submit"]');

        // On attend d'atterrir sur le dashboard
        await expect(page).toHaveURL('/');
        
        // Vérification de la disparition du loader
        await expect(page.locator('text=Vérification des accès...')).toBeHidden({ timeout: 15000 });

        // Vérification que les widgets s'affichent bien
        await expect(page.locator('text=Flux de Trésorerie')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('text=Flux Stocks')).toBeVisible();
    });

    test('2. Navigation vers la Caisse (POS)', async ({ page }) => {
        // Login rapide avec grand timeout
        await page.goto('/login', { timeout: 90000 });
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', ADMIN_PASS);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/');

        // On clique sur le lien de la caisse dans la sidebar
        await page.click('a[href="/pos"]');
        
        // On vérifie qu'on est au bon endroit
        await expect(page).toHaveURL(/.*\/pos/);

        // On attend que la grille de produits charge
        await expect(page.locator('text=Scanner ou rechercher un produit...')).toBeVisible({ timeout: 10000 });
        
        // Vérification que le résumé de la commande est visible
        await expect(page.locator('text=Total à payer')).toBeVisible();
    });

    test('3. Recherche et ajout de produit au panier', async ({ page }) => {
        await page.goto('/login', { timeout: 90000 });
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', ADMIN_PASS);
        await page.click('button[type="submit"]');
        
        await page.goto('/pos', { timeout: 90000 });
        
        // On attend le chargement
        await expect(page.locator('.lucide-loader-2')).toBeHidden({ timeout: 15000 });
        
        // On sélectionne le premier bouton produit (CatalogItem)
        const firstProductBtn = page.locator('button:has(.lucide-shopping-cart)').first();
        await expect(firstProductBtn).toBeVisible({ timeout: 15000 });
        await firstProductBtn.click();

        // On vérifie que le panier affiche le badge de quantité ou Total
        await expect(page.locator('text=Total à Régler')).toBeVisible();
        await expect(page.locator('text=VALIDER LE PAIEMENT')).toBeVisible();
        
        // Le bouton "VALIDER LE PAIEMENT" doit être actif (ne pas avoir l'attribut disabled)
        const payButton = page.locator('button:has-text("VALIDER LE PAIEMENT")');
        await expect(payButton).toBeEnabled();
    });
});
