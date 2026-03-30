import { test, expect } from '@playwright/test';

test.describe('Sekou Draperie - Flux Critiques', () => {

    // On utilise l'admin défini dans le script de seed
    const ADMIN_EMAIL = 'admin@sekou-draperie.com';
    const ADMIN_PASS = 'Admin@Sekou2026';

    test('1. Authentification Admin et accès Dashboard', async ({ page }) => {
        // Redirection vers login forcée
        await page.goto('/');
        await expect(page).toHaveURL(/.*\/login/);

        // Remplissage du formulaire
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', ADMIN_PASS);
        
        // Clic sur le bouton de connexion
        await page.click('button[type="submit"]');

        // On attend d'atterrir sur le dashboard
        await expect(page).toHaveURL('/');
        
        // Vérification de la disparition du loader
        await expect(page.locator('text=Vérification des accès')).toBeHidden({ timeout: 10000 });

        // Vérification que les widgets s'affichent bien
        await expect(page.locator('text=Flux de Trésorerie')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('text=Flux Stocks')).toBeVisible();
    });

    test('2. Navigation vers la Caisse (POS)', async ({ page }) => {
        // Login rapide
        await page.goto('/login');
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
        await page.goto('/login');
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', ADMIN_PASS);
        await page.click('button[type="submit"]');
        
        await page.goto('/pos');
        
        // On attend le chargement
        await expect(page.locator('.lucide-loader-2')).toBeHidden({ timeout: 15000 });
        
        // Clic sur le premier produit affiché dans la grille pour l'ajouter au panier
        // On sélectionne la première carte produit (on assume que le catalogue initial a été seedé)
        const firstProductCard = page.locator('.grid > div').first();
        await expect(firstProductCard).toBeVisible();
        await firstProductCard.click();

        // On vérifie que le panier affiche au moins "1" dans les quantités
        await expect(page.locator('text=1 x')).toBeVisible();
        
        // Le bouton "ENCAISSER" doit être actif
        const payButton = page.locator('button:has-text("ENCAISSER")');
        await expect(payButton).toBeEnabled();
    });
});
