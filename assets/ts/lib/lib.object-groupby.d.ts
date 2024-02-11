export {}

declare global {

    interface ObjectConstructor {

        /**
         * Groups the given objects by a key taken from the object values.
         * @param items Items to group.
         * @param callbackFn Function identifying the key for the groups.
         */
        groupBy<T, K extends PropertyKey>(
            items: Iterable<T>,
            callbackFn: (element: T, index: number) => K
        ): Record<K, T[]>;

    }

}
