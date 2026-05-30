import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

type NavKey =
    | 'highlights'
    | 'scores'
    | 'standings'
    | 'teams'
    | 'players'
    | 'stats'
    | 'hockey-iq';

type LabLayoutProps = PropsWithChildren<{
    active?: NavKey;
}>;

const navItems: Array<{ key: NavKey; label: string; href: string }> = [
    { key: 'highlights', label: 'Highlights', href: '/lab' },
    { key: 'scores', label: 'Scores', href: '/lab/scores' },
    { key: 'standings', label: 'Standings', href: '/lab/standings' },
    { key: 'teams', label: 'Teams', href: '/lab/teams' },
    { key: 'players', label: 'Players', href: '/lab/players' },
    { key: 'stats', label: 'Stats', href: '/lab/stats' },
    { key: 'hockey-iq', label: 'Hockey IQ', href: '/lab/hockey-iq' },
];

export default function LabLayout({ active, children }: LabLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto h-16 max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-full items-center">
                        <div className="w-48">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-lg font-semibold text-gray-900"
                            >
                                <img
                                    src="/brand/logo-transparent.png"
                                    alt="The Hockey Lab logo"
                                    className="h-9 w-9 object-contain"
                                />
                                <span>The Hockey Lab</span>
                            </Link>
                        </div>
                        <div className="flex flex-1 justify-center">
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                {navItems.map((item) => {
                                    const isActive = item.key === active;
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            className={
                                                isActive
                                                    ? 'font-semibold text-gray-900'
                                                    : 'transition hover:text-gray-900'
                                            }
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="w-48" />
                    </div>
                </div>
            </nav>
            <main className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
