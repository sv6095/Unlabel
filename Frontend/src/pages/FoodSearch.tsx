import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Loader2, X, Package, MapPin, Factory, Tag, AlertCircle, Leaf } from 'lucide-react';
import { FloatingSeeds } from '@/components/ui/FloatingSeeds';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/api';

interface Product {
    id: string;
    product_name: string;
    brands: string;
    image_url: string | null;
    nutrition_grade: string;
    ingredients_text: string;
}

interface DetailedProduct {
    id: string;
    product_name: string;
    brands: string;
    categories: string;
    labels: string;
    quantity: string;
    packaging: string;
    manufacturing_places: string;
    origins: string;
    countries: string;
    image_url: string | null;
    image_nutrition_url: string | null;
    image_ingredients_url: string | null;
    nutrition_grade: string;
    nutriments: any;
    nutriscore_score: number | null;
    ingredients_text: string;
    allergens: string;
    traces: string;
    nova_group: number | null;
    ecoscore_grade: string;
    additives_tags: string[];
}

const FoodSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<DetailedProduct | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setResults([]);
        setHasSearched(true);

        try {
            const response = await api.get(`/food/search`, {
                params: { query: query }
            });

            if (response.data.status === 'success') {
                setResults(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "An error occurred while searching. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductClick = async (productId: string) => {
        setIsLoadingDetails(true);
        setShowDetailsDialog(true);
        setSelectedProduct(null);

        try {
            const response = await api.get(`/food/product/${productId}`);

            if (response.data.status === 'success') {
                setSelectedProduct(response.data.data);
            } else {
                setError(response.data.message);
                setShowDetailsDialog(false);
            }
        } catch (err: any) {
            console.error(err);
            setError("Failed to load product details.");
            setShowDetailsDialog(false);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const getNutritionGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'bg-green-500';
            case 'B': return 'bg-lime-500';
            case 'C': return 'bg-yellow-500';
            case 'D': return 'bg-orange-500';
            case 'E': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-sans text-foreground">
            <FloatingSeeds />
            <Header />
            <div className="container mx-auto pt-24 pb-12 px-4 relative z-10">
                <div className="max-w-2xl mx-auto text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-display mb-4 text-glow-green">
                        Global Food Intelligence
                    </h1>
                    <p className="text-muted-foreground text-lg mb-8">
                        Search across over 3 million products from the Open Food Facts database.
                    </p>

                    <GlassCard className="p-2 flex items-center gap-2">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for a product (e.g., Ketchup, Nutella)..."
                            className="border-none bg-transparent focus-visible:ring-0 text-lg h-12"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch(e);
                            }}
                        />
                        <Button
                            onClick={handleSearch}
                            disabled={isLoading}
                            size="icon"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-10 rounded-xl"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        </Button>
                    </GlassCard>
                </div>

                {error && (
                    <div className="max-w-2xl mx-auto mb-8">
                        <GlassCard variant="red" className="p-4 text-center">
                            <p className="text-destructive-foreground font-medium">{error}</p>
                        </GlassCard>
                    </div>
                )}

                {hasSearched && !isLoading && !error && results.length === 0 && (
                    <div className="max-w-2xl mx-auto mb-8 text-center text-muted-foreground">
                        <p>No products found. Try a different search term.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((product) => (
                        <GlassCard
                            key={product.id}
                            className="flex flex-col h-full hover:border-primary/50 transition-colors duration-300 cursor-pointer"
                            onClick={() => handleProductClick(product.id)}
                        >
                            <div className="aspect-video bg-muted/20 relative overflow-hidden flex items-center justify-center p-4">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.product_name}
                                        className="object-contain h-full w-full hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="text-muted-foreground text-sm">No Image Available</div>
                                )}
                                {product.nutrition_grade && product.nutrition_grade !== 'N/A' && (
                                    <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${getNutritionGradeColor(product.nutrition_grade)}`}>
                                        {product.nutrition_grade}
                                    </div>
                                )}
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="mb-auto">
                                    <div className="text-xs text-primary mb-1 font-medium tracking-wider uppercase">{product.brands}</div>
                                    <h3 className="font-display text-xl mb-2 line-clamp-2">{product.product_name}</h3>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border/50">
                                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                                        {product.ingredients_text ? product.ingredients_text : "Ingredients not available."}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>

            {/* Product Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl pr-8">
                            {selectedProduct?.product_name || 'Loading...'}
                        </DialogTitle>
                    </DialogHeader>

                    {isLoadingDetails ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : selectedProduct ? (
                        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
                            <div className="space-y-6">
                                {/* Product Images */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {selectedProduct.image_url && (
                                        <div className="border border-border rounded-lg overflow-hidden">
                                            <img src={selectedProduct.image_url} alt="Product" className="w-full h-48 object-contain bg-muted/20 p-2" />
                                            <div className="text-xs text-center py-2 bg-muted/30">Product</div>
                                        </div>
                                    )}
                                    {selectedProduct.image_nutrition_url && (
                                        <div className="border border-border rounded-lg overflow-hidden">
                                            <img src={selectedProduct.image_nutrition_url} alt="Nutrition" className="w-full h-48 object-contain bg-muted/20 p-2" />
                                            <div className="text-xs text-center py-2 bg-muted/30">Nutrition Facts</div>
                                        </div>
                                    )}
                                    {selectedProduct.image_ingredients_url && (
                                        <div className="border border-border rounded-lg overflow-hidden">
                                            <img src={selectedProduct.image_ingredients_url} alt="Ingredients" className="w-full h-48 object-contain bg-muted/20 p-2" />
                                            <div className="text-xs text-center py-2 bg-muted/30">Ingredients</div>
                                        </div>
                                    )}
                                </div>

                                {/* Grades and Scores */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {selectedProduct.nutrition_grade && selectedProduct.nutrition_grade !== 'N/A' && (
                                        <div className="text-center p-4 border border-border rounded-lg">
                                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center font-bold text-2xl text-white ${getNutritionGradeColor(selectedProduct.nutrition_grade)}`}>
                                                {selectedProduct.nutrition_grade}
                                            </div>
                                            <div className="text-xs mt-2 text-muted-foreground">Nutri-Score</div>
                                        </div>
                                    )}
                                    {selectedProduct.ecoscore_grade && selectedProduct.ecoscore_grade !== 'N/A' && (
                                        <div className="text-center p-4 border border-border rounded-lg">
                                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center font-bold text-2xl text-white ${getNutritionGradeColor(selectedProduct.ecoscore_grade)}`}>
                                                {selectedProduct.ecoscore_grade}
                                            </div>
                                            <div className="text-xs mt-2 text-muted-foreground">Eco-Score</div>
                                        </div>
                                    )}
                                    {selectedProduct.nova_group && (
                                        <div className="text-center p-4 border border-border rounded-lg">
                                            <div className="text-3xl font-bold text-primary">{selectedProduct.nova_group}</div>
                                            <div className="text-xs mt-2 text-muted-foreground">NOVA Group</div>
                                        </div>
                                    )}
                                </div>

                                {/* Tabs for detailed information */}
                                <Tabs defaultValue="info" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="info">Info</TabsTrigger>
                                        <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                                        <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="info" className="space-y-4 mt-4">
                                        <InfoRow icon={<Tag className="h-4 w-4" />} label="Brand" value={selectedProduct.brands} />
                                        <InfoRow icon={<Package className="h-4 w-4" />} label="Quantity" value={selectedProduct.quantity} />
                                        <InfoRow icon={<Package className="h-4 w-4" />} label="Packaging" value={selectedProduct.packaging} />
                                        <InfoRow icon={<MapPin className="h-4 w-4" />} label="Countries" value={selectedProduct.countries} />
                                        <InfoRow icon={<Factory className="h-4 w-4" />} label="Manufacturing" value={selectedProduct.manufacturing_places} />
                                        <InfoRow icon={<MapPin className="h-4 w-4" />} label="Origins" value={selectedProduct.origins} />
                                        <InfoRow icon={<Tag className="h-4 w-4" />} label="Categories" value={selectedProduct.categories} />
                                        <InfoRow icon={<Leaf className="h-4 w-4" />} label="Labels" value={selectedProduct.labels} />
                                    </TabsContent>

                                    <TabsContent value="nutrition" className="space-y-4 mt-4">
                                        {selectedProduct.nutriments && Object.keys(selectedProduct.nutriments).length > 0 ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                {Object.entries(selectedProduct.nutriments)
                                                    .filter(([key]) => !key.includes('_') && !key.includes('unit'))
                                                    .slice(0, 12)
                                                    .map(([key, value]) => (
                                                        <div key={key} className="border border-border rounded-lg p-3">
                                                            <div className="text-xs text-muted-foreground capitalize">{key.replace(/-/g, ' ')}</div>
                                                            <div className="text-lg font-semibold">{value as string}</div>
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-center py-8">No nutrition data available</p>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="ingredients" className="space-y-4 mt-4">
                                        <div className="border border-border rounded-lg p-4">
                                            <h4 className="font-semibold mb-2">Ingredients</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {selectedProduct.ingredients_text || 'Not available'}
                                            </p>
                                        </div>

                                        {selectedProduct.allergens && (
                                            <div className="border border-destructive/50 bg-destructive/5 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                                    <h4 className="font-semibold text-destructive">Allergens</h4>
                                                </div>
                                                <p className="text-sm">{selectedProduct.allergens}</p>
                                            </div>
                                        )}

                                        {selectedProduct.traces && (
                                            <div className="border border-border rounded-lg p-4">
                                                <h4 className="font-semibold mb-2">May Contain Traces</h4>
                                                <p className="text-sm text-muted-foreground">{selectedProduct.traces}</p>
                                            </div>
                                        )}

                                        {selectedProduct.additives_tags && selectedProduct.additives_tags.length > 0 && (
                                            <div className="border border-border rounded-lg p-4">
                                                <h4 className="font-semibold mb-2">Additives</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedProduct.additives_tags.map((additive, idx) => (
                                                        <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                                                            {additive.replace('en:', '')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </ScrollArea>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => {
    if (!value) return null;

    return (
        <div className="flex items-start gap-3 border-b border-border/50 pb-3">
            <div className="text-primary mt-1">{icon}</div>
            <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">{label}</div>
                <div className="text-sm">{value}</div>
            </div>
        </div>
    );
};

export default FoodSearch;
