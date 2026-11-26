<?php

declare(strict_types=1);

return [
    'Unterordner ergibt sich aus dem Ort von index.php' => static function (): void {
        assert_same('', kk_base_path('/index.php'));
        assert_same('', kk_base_path('/public/index.php'));
        assert_same('/apps/krautkompass', kk_base_path('/apps/krautkompass/public/index.php'));
        assert_same('/apps/krautkompass', kk_base_path('/apps/krautkompass/index.php'));
        assert_same('', kk_base_path('/api/products'));
        assert_same('', kk_base_path());
    },
];
