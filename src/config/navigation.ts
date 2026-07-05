import {
	Gift,
	BookOpen,
	PawPrint,
	Package,
	Trophy,
	RefreshCw,
	Gamepad2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'codes' -> t('nav.codes')
	path: string // URL 路径，如 '/codes'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

// My Dino Park 导航分类（基于 0_meta/关键词.json + articles 目录，删除 community）
export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'codes', path: '/codes', icon: Gift, isContentType: true },
	{ key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
	{ key: 'dinos', path: '/dinos', icon: PawPrint, isContentType: true },
	{ key: 'eggs', path: '/eggs', icon: Package, isContentType: true },
	{ key: 'levels', path: '/levels', icon: Trophy, isContentType: true },
	{ key: 'updates', path: '/updates', icon: RefreshCw, isContentType: true },
	{ key: 'roblox', path: '/roblox', icon: Gamepad2, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/' -> ['codes', 'guide', 'dinos', 'eggs', 'levels', 'updates', 'roblox']

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
