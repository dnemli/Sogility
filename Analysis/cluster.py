# 23. KMEANS CLUSTERING

from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

# Use RPS 
X = RPS_core.copy()
X.index = RPS_core.index

k = 4
kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
clusters = kmeans.fit_predict(X)

clustered_players = X.copy()
clustered_players['cluster'] = clusters
clustered_players['full_name'] = clustered_players.index

# PCA

pca = PCA(n_components=2, random_state=42)
X_pca = pca.fit_transform(X)

clustered_players['PC1'] = X_pca[:, 0]
clustered_players['PC2'] = X_pca[:, 1]

# CLUSTER CENTERS

cluster_centers = pd.DataFrame(
    kmeans.cluster_centers_,
    columns=core_skills
)

cluster_centers['cluster'] = cluster_centers.index

# COMPUTE ARCHETYPE SCORES FOR CLUSTERS


def compute_archetypes(df):
    out = df.copy()

    out['Playmaker'] = (
        0.30 * out['Passing'] +
        0.30 * out['Vision'] +
        0.25 * out['First Touch'] +
        0.10 * out['Dribbling'] +
        0.05 * out['Agility']
    )

    out['Explosive Athlete'] = (
        0.40 * out['Agility'] +
        0.35 * out['Dribbling'] +
        0.15 * out['First Touch'] +
        0.10 * out['Vision']
    )

    out['Attacker'] = (
        0.40 * out['Dribbling'] +
        0.30 * out['Agility'] +
        0.20 * out['First Touch'] +
        0.10 * out['Vision']
    )

    out['Control / Possession'] = (
        0.35 * out['First Touch'] +
        0.35 * out['Passing'] +
        0.20 * out['Vision'] +
        0.10 * out['Dribbling']
    )

    return out

cluster_centers = compute_archetypes(cluster_centers)

archetype_cols = [
    'Playmaker',
    'Explosive Athlete',
    'Attacker',
    'Control / Possession'
]

# FORCE UNIQUE ARCHETYPE ASSIGNMENT

# Rank archetypes per cluster
cluster_rankings = cluster_centers[archetype_cols].rank(axis=1, ascending=False)

assigned = {}
used_archetypes = set()

for i in cluster_centers.index:
    scores = cluster_centers.loc[i, archetype_cols].sort_values(ascending=False)

    for archetype in scores.index:
        if archetype not in used_archetypes:
            assigned[i] = archetype
            used_archetypes.add(archetype)
            break

# Map names
cluster_centers['cluster_name'] = cluster_centers.index.map(assigned)

cluster_centers = cluster_centers[['cluster', 'cluster_name'] + core_skills]

print("\nCluster centers (FINAL FIXED):")
display(cluster_centers.round(1))

# MAP TO PLAYERS

cluster_name_map = dict(zip(cluster_centers['cluster'], cluster_centers['cluster_name']))
clustered_players['cluster_name'] = clustered_players['cluster'].map(cluster_name_map)

print("\nPlayers with archetypes:")
display(clustered_players[['full_name', 'cluster', 'cluster_name']].head(20))

# PLOT

plt.figure(figsize=(10, 6))

for cluster_id in sorted(clustered_players['cluster'].unique()):
    subset = clustered_players[clustered_players['cluster'] == cluster_id]
    label_name = cluster_name_map[cluster_id]

    plt.scatter(subset['PC1'], subset['PC2'], label=label_name, alpha=0.8)

plt.title('Player Clusters (Final Archetypes)')
plt.xlabel('PC1')
plt.ylabel('PC2')
plt.legend()
plt.grid(True)
plt.show()

# PLOT WITH LABELED PLAYERS

import numpy as np

# Find closest player to each cluster center
representative_players = []

for cluster_id in sorted(clustered_players['cluster'].unique()):
    cluster_subset = clustered_players[clustered_players['cluster'] == cluster_id]

    center = cluster_centers.loc[cluster_id, core_skills].values.astype(float)

    # Compute distance to center
    distances = np.linalg.norm(cluster_subset[core_skills].values - center, axis=1)

    # Get closest player
    closest_idx = distances.argmin()
    representative_players.append(cluster_subset.iloc[closest_idx])

rep_df = pd.DataFrame(representative_players)

print("Representative players (one per cluster):")
display(rep_df[['full_name', 'cluster_name']])

plt.figure(figsize=(10, 6))

# Plot clusters
for cluster_id in sorted(clustered_players['cluster'].unique()):
    subset = clustered_players[clustered_players['cluster'] == cluster_id]
    label_name = cluster_name_map[cluster_id]
    plt.scatter(subset['PC1'], subset['PC2'], label=label_name, alpha=0.6)

# Label representative players
for _, row in rep_df.iterrows():
    plt.scatter(row['PC1'], row['PC2'], color='black', s=5)
    plt.text(row['PC1'], row['PC2'], row['full_name'], fontsize=10, weight='light')

plt.title('Player Clusters with Representative Players')
plt.xlabel('PC1')
plt.ylabel('PC2')
plt.legend()
plt.grid(True)
plt.show()