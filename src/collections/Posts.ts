import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'published_date', 'tags'],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'content', type: 'richText' },
            { name: 'published_date', type: 'date', label: 'Published Date' },
            {
              name: 'tags',
              type: 'select',
              hasMany: true,
              label: 'Tags',
              options: [
                'VPN Guide',
                'Proxy Tutorial',
                'Unblock Websites',
                'Privacy Tips',
                'Streaming Access',
                'Gaming Unblock',
                'Social Media Access',
                'Regional Restrictions',
                'Security Tips',
                'Tool Reviews',
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'meta_title', type: 'text', maxLength: 60, label: 'Meta Title' },
            { name: 'meta_description', type: 'textarea', maxLength: 160, label: 'Meta Description' },
          ],
        },
      ],
    },
  ],
}
